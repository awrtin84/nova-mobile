import os
import secrets
from contextlib import asynccontextmanager
from math import ceil

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from .admin import router as admin_router
from .database import Base, SessionLocal, engine, get_db
from .models import Brand, Category, Order, OrderItem, Product
from .schemas import (
    BrandOut,
    CategoryOut,
    HomeOut,
    OrderIn,
    OrderOut,
    ProductDetailOut,
    ProductListOut,
    ProductPage,
)
from .seed import seed

FREE_SHIPPING_THRESHOLD = 5_000_000
SHIPPING_FEE = 150_000

SORTS = {
    "newest": Product.created_at.desc(),
    "cheapest": Product.final_price.asc(),
    "expensive": Product.final_price.desc(),
    "bestselling": Product.sold_count.desc(),
    "rating": Product.rating.desc(),
    "discount": Product.discount_percent.desc(),
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Nova Mobile API", version="1.0.0", lifespan=lifespan)

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)


def product_options():
    return (joinedload(Product.brand), joinedload(Product.category))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/config")
def config():
    return {"free_shipping_threshold": FREE_SHIPPING_THRESHOLD, "shipping_fee": SHIPPING_FEE}


@app.get("/api/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    counts = dict(
        db.execute(select(Product.category_id, func.count()).group_by(Product.category_id)).all()
    )
    categories = db.scalars(select(Category).order_by(Category.id)).all()
    return [
        CategoryOut(
            id=c.id, slug=c.slug, name=c.name, kind=c.kind, product_count=counts.get(c.id, 0)
        )
        for c in categories
    ]


@app.get("/api/brands", response_model=list[BrandOut])
def list_brands(category: str | None = None, db: Session = Depends(get_db)):
    count_stmt = select(Product.brand_id, func.count()).group_by(Product.brand_id)
    if category:
        count_stmt = count_stmt.where(Product.category.has(Category.slug == category))
    counts = dict(db.execute(count_stmt).all())
    brands = db.scalars(select(Brand).order_by(Brand.id)).all()
    return [
        BrandOut(
            id=b.id, slug=b.slug, name=b.name, name_en=b.name_en, product_count=counts.get(b.id, 0)
        )
        for b in brands
        if counts.get(b.id, 0) > 0 or not category
    ]


@app.get("/api/home", response_model=HomeOut)
def home(db: Session = Depends(get_db)):
    base = select(Product).options(*product_options())
    deals = db.scalars(
        base.where(Product.discount_percent > 0, Product.stock > 0)
        .order_by(Product.discount_percent.desc(), Product.id)
        .limit(8)
    ).all()
    newest = db.scalars(base.order_by(Product.created_at.desc(), Product.id).limit(8)).all()
    bestsellers = db.scalars(base.order_by(Product.sold_count.desc(), Product.id).limit(8)).all()
    return HomeOut(
        deals=[ProductListOut.model_validate(p) for p in deals],
        newest=[ProductListOut.model_validate(p) for p in newest],
        bestsellers=[ProductListOut.model_validate(p) for p in bestsellers],
    )


@app.get("/api/products", response_model=ProductPage)
def list_products(
    q: str | None = None,
    category: str | None = None,
    brand: list[str] = Query(default=[]),
    min_price: int | None = Query(default=None, ge=0),
    max_price: int | None = Query(default=None, ge=0),
    in_stock: bool = False,
    on_sale: bool = False,
    sort: str = "newest",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=48),
    db: Session = Depends(get_db),
):
    stmt = select(Product)

    if q and q.strip():
        term = f"%{q.strip()}%"
        stmt = stmt.where(or_(Product.name.ilike(term), Product.name_en.ilike(term)))
    if category:
        stmt = stmt.where(Product.category.has(Category.slug == category))
    if brand:
        stmt = stmt.where(Product.brand.has(Brand.slug.in_(brand)))
    if min_price is not None:
        stmt = stmt.where(Product.final_price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.final_price <= max_price)
    if in_stock:
        stmt = stmt.where(Product.stock > 0)
    if on_sale:
        stmt = stmt.where(Product.discount_percent > 0)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    order = SORTS.get(sort, SORTS["newest"])

    rows = db.scalars(
        stmt.options(*product_options())
        .order_by(order, Product.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    return ProductPage(
        items=[ProductListOut.model_validate(p) for p in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, ceil(total / page_size)),
    )


@app.get("/api/products/{slug}", response_model=ProductDetailOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.slug == slug).options(*product_options()))
    if product is None:
        raise HTTPException(status_code=404, detail="محصول پیدا نشد")
    return product


@app.get("/api/products/{slug}/related", response_model=list[ProductListOut])
def related_products(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(select(Product).where(Product.slug == slug))
    if product is None:
        raise HTTPException(status_code=404, detail="محصول پیدا نشد")
    return db.scalars(
        select(Product)
        .where(Product.category_id == product.category_id, Product.id != product.id)
        .options(*product_options())
        .order_by(Product.sold_count.desc(), Product.id)
        .limit(5)
    ).all()


def generate_order_code(db: Session) -> str:
    while True:
        code = "NV" + "".join(secrets.choice("0123456789") for _ in range(8))
        if db.scalar(select(Order.id).where(Order.code == code)) is None:
            return code


@app.post("/api/orders", response_model=OrderOut, status_code=201)
def create_order(payload: OrderIn, db: Session = Depends(get_db)):
    per_product: dict[int, int] = {}
    per_line: dict[tuple[int, str], int] = {}
    for line in payload.items:
        color = line.color.strip()
        per_product[line.product_id] = per_product.get(line.product_id, 0) + line.quantity
        key = (line.product_id, color)
        per_line[key] = per_line.get(key, 0) + line.quantity

    products = {
        p.id: p for p in db.scalars(select(Product).where(Product.id.in_(list(per_product))))
    }

    for product_id, quantity in per_product.items():
        product = products.get(product_id)
        if product is None:
            raise HTTPException(status_code=400, detail="یکی از محصولات سبد خرید دیگر موجود نیست")
        if quantity > 10:
            raise HTTPException(status_code=400, detail=f"حداکثر تعداد سفارش «{product.name}» ۱۰ عدد است")
        if product.stock < quantity:
            raise HTTPException(status_code=409, detail=f"موجودی «{product.name}» کافی نیست")

    lines: list[OrderItem] = []
    subtotal = 0

    for (product_id, color), quantity in per_line.items():
        product = products[product_id]
        subtotal += product.final_price * quantity
        lines.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                color=color,
                unit_price=product.final_price,
                quantity=quantity,
            )
        )

    for product_id, quantity in per_product.items():
        products[product_id].stock -= quantity

    shipping_fee = 0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_FEE

    order = Order(
        code=generate_order_code(db),
        customer_name=payload.customer_name,
        phone=payload.phone,
        city=payload.city,
        address=payload.address,
        postal_code=payload.postal_code,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total=subtotal + shipping_fee,
        items=lines,
    )
    db.add(order)
    db.commit()
    return order


@app.get("/api/orders/{code}", response_model=OrderOut)
def get_order(code: str, db: Session = Depends(get_db)):
    order = db.scalar(select(Order).where(Order.code == code).options(selectinload(Order.items)))
    if order is None:
        raise HTTPException(status_code=404, detail="سفارش پیدا نشد")
    return order