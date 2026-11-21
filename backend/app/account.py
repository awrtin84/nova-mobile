import hashlib
import hmac
import os
import re
import secrets
import time

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .auth import ADMIN_SECRET
from .database import get_db
from .models import Order, User
from .schemas import OrderOut

router = APIRouter(prefix="/api/account")

OTP_TTL = 120
OTP_RESEND = 60
OTP_MAX_ATTEMPTS = 5
USER_TOKEN_TTL = 60 * 60 * 24 * 30
DEV_MODE = os.getenv("OTP_DEV", "1") == "1"

otp_store: dict[str, dict] = {}

PERSIAN_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def normalize_phone(raw: str) -> str:
    digits = raw.translate(PERSIAN_DIGITS)
    digits = re.sub(r"\D", "", digits)
    if digits.startswith("0098"):
        digits = "0" + digits[4:]
    elif digits.startswith("98") and len(digits) == 12:
        digits = "0" + digits[2:]
    elif len(digits) == 10 and digits.startswith("9"):
        digits = "0" + digits
    if not re.fullmatch(r"09\d{9}", digits):
        raise HTTPException(status_code=422, detail="شماره موبایل معتبر نیست")
    return digits


def sign(payload: str) -> str:
    return hmac.new(ADMIN_SECRET, f"user:{payload}".encode(), hashlib.sha256).hexdigest()


def create_user_token(user_id: int) -> str:
    expires = int(time.time()) + USER_TOKEN_TTL
    payload = f"{user_id}.{expires}"
    return f"{payload}.{sign(payload)}"


def parse_user_token(token: str) -> int | None:
    try:
        user_id, expires, signature = token.split(".")
        payload = f"{user_id}.{expires}"
        if not hmac.compare_digest(signature, sign(payload)):
            return None
        if int(expires) < time.time():
            return None
        return int(user_id)
    except (ValueError, AttributeError):
        return None


def current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="ابتدا وارد حساب خود شوید")
    user_id = parse_user_token(authorization[7:].strip())
    user = db.get(User, user_id) if user_id else None
    if user is None:
        raise HTTPException(status_code=401, detail="نشست شما منقضی شده است")
    return user


class UserOut(BaseModel):
    id: int
    phone: str
    name: str

    model_config = {"from_attributes": True}


class RequestIn(BaseModel):
    phone: str


class VerifyIn(BaseModel):
    phone: str
    code: str = Field(min_length=4, max_length=6)
    name: str = Field(default="", max_length=120)


class ProfileIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)


@router.post("/request-otp")
def request_otp(payload: RequestIn, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)
    now = time.time()
    entry = otp_store.get(phone)
    if entry and now - entry["sent_at"] < OTP_RESEND:
        wait = int(OTP_RESEND - (now - entry["sent_at"]))
        raise HTTPException(status_code=429, detail=f"لطفاً {wait} ثانیه دیگر دوباره تلاش کنید")

    code = f"{secrets.randbelow(90000) + 10000}"
    otp_store[phone] = {"code": code, "expires": now + OTP_TTL, "sent_at": now, "attempts": 0}

    exists = db.scalar(select(User.id).where(User.phone == phone)) is not None
    result = {"phone": phone, "is_new": not exists, "expires_in": OTP_TTL, "resend_in": OTP_RESEND}
    if DEV_MODE:
        result["dev_code"] = code
    return result


@router.post("/verify")
def verify(payload: VerifyIn, db: Session = Depends(get_db)):
    phone = normalize_phone(payload.phone)
    entry = otp_store.get(phone)
    if entry is None or entry["expires"] < time.time():
        otp_store.pop(phone, None)
        raise HTTPException(status_code=400, detail="کد منقضی شده است؛ کد جدید دریافت کنید")
    if entry["attempts"] >= OTP_MAX_ATTEMPTS:
        otp_store.pop(phone, None)
        raise HTTPException(status_code=429, detail="تعداد تلاش‌ها زیاد بود؛ کد جدید دریافت کنید")

    code = payload.code.translate(PERSIAN_DIGITS).strip()
    if not hmac.compare_digest(code, entry["code"]):
        entry["attempts"] += 1
        raise HTTPException(status_code=400, detail="کد وارد شده اشتباه است")

    otp_store.pop(phone, None)
    user = db.scalar(select(User).where(User.phone == phone))
    created = False
    if user is None:
        user = User(phone=phone, name=payload.name.strip())
        db.add(user)
        db.commit()
        db.refresh(user)
        created = True
    return {"token": create_user_token(user.id), "user": UserOut.model_validate(user), "created": created}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.put("/me", response_model=UserOut)
def update_me(payload: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    user.name = payload.name.strip()
    db.commit()
    db.refresh(user)
    return user


@router.get("/orders", response_model=list[OrderOut])
def my_orders(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(Order)
        .where(Order.phone == user.phone)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(50)
    ).all()
    return rows