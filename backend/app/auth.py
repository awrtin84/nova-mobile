import hashlib
import hmac
import os
import time

from fastapi import Header, HTTPException

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "change-this-secret").encode()
TOKEN_TTL_SECONDS = 60 * 60 * 12


def sign(payload: str) -> str:
    return hmac.new(ADMIN_SECRET, payload.encode(), hashlib.sha256).hexdigest()


def check_password(password: str) -> bool:
    return hmac.compare_digest(password.encode(), ADMIN_PASSWORD.encode())


def create_token() -> str:
    expires = str(int(time.time()) + TOKEN_TTL_SECONDS)
    return f"{expires}.{sign(expires)}"


def verify_token(token: str) -> bool:
    expires, _, signature = token.partition(".")
    if not expires.isdigit() or not signature:
        return False
    if not hmac.compare_digest(signature, sign(expires)):
        return False
    return int(expires) > time.time()


def require_admin(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer ") or not verify_token(authorization[7:]):
        raise HTTPException(status_code=401, detail="دسترسی نامعتبر است")