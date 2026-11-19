from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    kind: Mapped[str] = mapped_column(String(40))

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    name_en: Mapped[str] = mapped_column(String(120))

    products: Mapped[list["Product"]] = relationship(back_populates="brand")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    name_en: Mapped[str] = mapped_column(String(255), default="")
    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    price: Mapped[int] = mapped_column(Integer)
    discount_percent: Mapped[int] = mapped_column(Integer, default=0)
    final_price: Mapped[int] = mapped_column(Integer, index=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)
    sold_count: Mapped[int] = mapped_column(Integer, default=0)
    visual_kind: Mapped[str] = mapped_column(String(40))
    hue: Mapped[int] = mapped_column(Integer, default=250)
    description: Mapped[str] = mapped_column(Text, default="")
    specs: Mapped[dict] = mapped_column(JSON, default=dict)
    colors: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    brand: Mapped[Brand] = relationship(back_populates="products")
    category: Mapped[Category] = relationship(back_populates="products")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(20))
    city: Mapped[str] = mapped_column(String(120))
    address: Mapped[str] = mapped_column(Text)
    postal_code: Mapped[str] = mapped_column(String(20), default="")
    subtotal: Mapped[int] = mapped_column(Integer)
    shipping_fee: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str] = mapped_column(String(255))
    color: Mapped[str] = mapped_column(String(60), default="")
    unit_price: Mapped[int] = mapped_column(Integer)
    quantity: Mapped[int] = mapped_column(Integer)

    order: Mapped[Order] = relationship(back_populates="items")
