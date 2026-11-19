import re
import secrets
from datetime import timedelta
from math import ceil
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from .auth import check_password, create_token, require_admin
from .database import get_db
from .models import Brand, Category, Order, OrderItem, Product, utcnow
from .schemas import OrderOut, ProductDetailOut, ProductListOut, ProductPage

Status = Literal["pending", "confirmed", "shipped", "delivered", "cancelled"]

router = APIRouter(prefix="/api/admin")
protected = APIRouter(dependencies=[Depends(require_admin)])


class LoginIn(BaseModel):
    password: str = Field(min_length=1, max_length=200)


class TokenOut(BaseModel):
    token: str


class ColorIn(BaseModel):
    name: str = Field(min_length=1, max_length=40)
    hex: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")


class ProductIn(BaseModel):
    name: str = Field(min_length=3, max_length=255)
    name_en: str = Field(default="", max_length=255)
    brand: str
    category: str
    price: int = Field(ge=1000, le=10_000_000_000)
    discount_percent: int = Field(default=0, ge=0, le=90)
    stock: int = Field(ge=0, le=100000)
    hue: int = Field(default=250, ge=0, le=360)
    description: str = Field(default="", max_length=4000)
    specs: dict[str, str] = Field(default_factory=dict)
    colors: list[ColorIn] = Field(default_factory=list, max_length=12)


class StatusIn(BaseModel):
    status: Status


class DayPoint(BaseModel):
    date: str
    revenue: int
    orders: int


class StatsOut(BaseModel):
    revenue: int
    orders: int
    pending: int
    products: int
    out_of_stock: int
    by_status: dict[str, int]
    low_stock: list[ProductListOut]
    recent_orders: list[OrderOut]
    daily: list[DayPoint]


class OrderPage(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    pages: int


def product_options():
    return (joinedload(Product.brand), joinedload(Product.category))


def compute_final_price(price: int, discount: int) -> int:
    return round(price * (100 - discount) / 100 / 1000) * 1000


def make_slug(db: Session, text: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or f"product-{secrets.token_hex(3)}"
    slug = base
    counter = 2
    while db.scalar(select(Product.id).where(Product.slug == slug)) is not None:
        slug = f"{base}-{counter}"
        counter += 1
    return slug


def resolve_refs(db: Session, data: ProductIn) -> tuple[Brand, Category]:
    brand = db.scalar(select(Brand).where(Brand.slug == data.brand))
    category = db.scalar(select(Category).where(Category.slug == data.category))
    if brand is None:
        raise HTTPException(status_code=400, detail="برند انتخاب‌شده معتبر نیست")
    if category is None:
        raise HTTPException(status_code=400, detail="دسته‌بندی انتخاب‌شده معتبر نیست")
    return brand, category


def apply_fields(product: Product, data: ProductIn, brand: Brand, category: Category) -> None:
    keep_kind = product.visual_kind and product.category_id == category.id
    product.name = data.name.strip()
    product.name_en = data.name_en.strip()
    product.brand = brand
    product.category = category
    product.price = data.price
    product.discount_percent = data.discount_percent
    product.final_price = compute_final_price(data.price, data.discount_percent)
    product.stock = data.stock
    product.hue = data.hue
    product.description = data.description.strip()
    product.specs = {k.strip(): v.strip() for k, v in data.specs.items() if k.strip() and v.strip()}
    product.colors = [{"name": c.name.strip(), "hex": c.hex} for c in data.colors]
    if not keep_kind:
        product.visual_kind = category.kind


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    if not check_password(payload.password):
        raise HTTPException(status_code=401, detail="رمز عبور نادرست است")
    return TokenOut(token=create_token())


@protected.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)):
    revenue = db.scalar(select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != "cancelled")) or 0
    orders = db.scalar(select(func.count()).select_from(Order)) or 0
    by_status = dict(db.execute(select(Order.status, func.count()).group_by(Order.status)).all())
    products = db.scalar(select(func.count()).select_from(Product)) or 0
    out_of_stock = db.scalar(select(func.count()).select_from(Product).where(Product.stock == 0)) or 0

    low_stock = db.scalars(
        select(Product)
        .where(Product.stock > 0, Product.stock <= 5)
        .options(*product_options())
        .order_by(Product.stock, Product.id)
        .limit(6)
    ).all()

    recent = db.scalars(
        select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc(), Order.id.desc()).limit(6)
    ).all()

    today = utcnow().date()
    days = [today - timedelta(days=offset) for offset in range(6, -1, -1)]
    buckets = {day: [0, 0] for day in days}
    since = utcnow() - timedelta(days=8)
    for created_at, total in db.execute(
        select(Order.created_at, Order.total).where(Order.status != "cancelled", Order.created_at >= since)
    ).all():
        key = created_at.date()
        if key in buckets:
            buckets[key][0] += total
            buckets[key][1] += 1

    return StatsOut(
        revenue=revenue,
        orders=orders,
        pending=by_status.get("pending", 0),
        products=products,
        out_of_stock=out_of_stock,
        by_status=by_status,
        low_stock=[ProductListOut.model_validate(p) for p in low_stock],
        recent_orders=[OrderOut.model_validate(o) for o in recent],
        daily=[DayPoint(date=day.isoformat(), revenue=buckets[day][0], orders=buckets[day][1]) for day in days],
    )


@protected.get("/products", response_model=ProductPage)
def list_products(
    q: str = "",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=15, ge=1, le=50),
    db: Session = Depends(get_db),
):
    stmt = select(Product)
    if q.strip():
        term = f"%{q.strip()}%"
        stmt = stmt.where(or_(Product.name.ilike(term), Product.name_en.ilike(term)))
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.options(*product_options()).order_by(Product.id.desc()).offset((page - 1) * page_size).limit(page_size)
    ).all()
    return ProductPage(
        items=[ProductListOut.model_validate(p) for p in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, ceil(total / page_size)),
    )


@protected.get("/products/{product_id}", response_model=ProductDetailOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.id == product_id).options(*product_options()))
    if product is None:
        raise HTTPException(status_code=404, detail="محصول پیدا نشد")
    return product


@protected.post("/products", response_model=ProductDetailOut, status_code=201)
def create_product(data: ProductIn, db: Session = Depends(get_db)):
    brand, category = resolve_refs(db, data)
    product = Product(
        slug=make_slug(db, data.name_en or data.name),
        visual_kind=category.kind,
        rating=0,
        reviews_count=0,
        sold_count=0,
    )
    apply_fields(product, data, brand, category)
    db.add(product)
    db.commit()
    return product


@protected.put("/products/{product_id}", response_model=ProductDetailOut)
def update_product(product_id: int, data: ProductIn, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.id == product_id).options(*product_options()))
    if product is None:
        raise HTTPException(status_code=404, detail="محصول پیدا نشد")
    brand, category = resolve_refs(db, data)
    apply_fields(product, data, brand, category)
    db.commit()
    return product


@protected.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="محصول پیدا نشد")
    used = db.scalar(select(func.count()).select_from(OrderItem).where(OrderItem.product_id == product_id)) or 0
    if used:
        raise HTTPException(
            status_code=409,
            detail="این محصول در سفارش‌ها استفاده شده و قابل حذف نیست؛ موجودی آن را صفر کنید",
        )
    db.delete(product)
    db.commit()
    return {"ok": True}


@protected.get("/orders", response_model=OrderPage)
def list_orders(
    status: str = "",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    stmt = select(Order)
    if status:
        stmt = stmt.where(Order.status == status)
    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.options(selectinload(Order.items))
        .order_by(Order.created_at.desc(), Order.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return OrderPage(
        items=[OrderOut.model_validate(o) for o in rows],
        total=total,
        page=page,
        pages=max(1, ceil(total / page_size)),
    )


@protected.patch("/orders/{code}/status", response_model=OrderOut)
def update_order_status(code: str, payload: StatusIn, db: Session = Depends(get_db)):
    order = db.scalar(select(Order).where(Order.code == code).options(selectinload(Order.items)))
    if order is None:
        raise HTTPException(status_code=404, detail="سفارش پیدا نشد")
    if order.status == "cancelled" and payload.status != "cancelled":
        raise HTTPException(status_code=409, detail="سفارش لغوشده قابل بازگشت نیست")
    if payload.status == "cancelled" and order.status == "delivered":
        raise HTTPException(status_code=409, detail="سفارش تحویل‌شده قابل لغو نیست")
    if payload.status == "cancelled" and order.status != "cancelled":
        for item in order.items:
            product = db.get(Product, item.product_id)
            if product is not None:
                product.stock += item.quantity
    order.status = payload.status
    db.commit()
    return order


router.include_router(protected)