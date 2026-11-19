from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


class Orm(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CategoryRef(Orm):
    slug: str
    name: str


class BrandRef(Orm):
    slug: str
    name: str


class CategoryOut(Orm):
    id: int
    slug: str
    name: str
    kind: str
    product_count: int = 0


class BrandOut(Orm):
    id: int
    slug: str
    name: str
    name_en: str
    product_count: int = 0


class ColorOut(BaseModel):
    name: str
    hex: str


class ProductListOut(Orm):
    id: int
    slug: str
    name: str
    name_en: str
    price: int
    discount_percent: int
    final_price: int
    stock: int
    rating: float
    reviews_count: int
    sold_count: int
    visual_kind: str
    hue: int
    brand: BrandRef
    category: CategoryRef


class ProductDetailOut(ProductListOut):
    description: str
    specs: dict[str, str]
    colors: list[ColorOut]


class ProductPage(BaseModel):
    items: list[ProductListOut]
    total: int
    page: int
    page_size: int
    pages: int


class HomeOut(BaseModel):
    deals: list[ProductListOut]
    newest: list[ProductListOut]
    bestsellers: list[ProductListOut]


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=10)
    color: str = Field(default="", max_length=60)


class OrderIn(BaseModel):
    customer_name: str = Field(min_length=3, max_length=160)
    phone: str = Field(pattern=r"^09\d{9}$")
    city: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=10, max_length=600)
    postal_code: str = Field(default="", pattern=r"^(\d{10})?$")
    items: list[OrderItemIn] = Field(min_length=1, max_length=30)

    @field_validator("phone", "postal_code", mode="before")
    @classmethod
    def normalize_digits(cls, value):
        if isinstance(value, str):
            return value.strip().translate(DIGITS)
        return value

    @field_validator("customer_name", "city", "address", mode="before")
    @classmethod
    def strip_text(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class OrderItemOut(Orm):
    product_id: int
    product_name: str
    color: str
    unit_price: int
    quantity: int


class OrderOut(Orm):
    code: str
    customer_name: str
    phone: str
    city: str
    address: str
    postal_code: str
    subtotal: int
    shipping_fee: int
    total: int
    status: str
    created_at: datetime
    items: list[OrderItemOut]
