# نوا موبایل (Nova Mobile)

فروشگاه آنلاین موبایل و لوازم جانبی، ساخته‌شده با Next.js 16 (App Router + TypeScript + Tailwind) و FastAPI (SQLAlchemy + SQLite).

## امکانات

- صفحه اصلی با اسلایدر تخفیف، دسته‌بندی‌ها و ردیف‌های پرفروش، جدیدترین و تخفیف‌دار
- لیست محصولات با جستجو، فیلتر دسته‌بندی، برند، بازه قیمت، موجودی و تخفیف، مرتب‌سازی و صفحه‌بندی (همه در URL)
- صفحه محصول با انتخاب رنگ، مشخصات فنی، محصولات مرتبط و محدودیت موجودی
- سبد خرید ماندگار (localStorage) با کنترل سقف موجودی
- تسویه‌حساب با اعتبارسنجی فارسی (پشتیبانی از ارقام فارسی)، ثبت سفارش، کسر موجودی و ارسال رایگان بالای ۵ میلیون تومان
- صفحه تأیید سفارش با کد پیگیری
- تصاویر محصولات به‌صورت SVG تولید می‌شوند، بدون نیاز به فایل تصویر

## اجرا

### بک‌اند

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

در اولین اجرا دیتابیس `shop.db` ساخته و با ۳۹ محصول نمونه پر می‌شود. مستندات API: http://127.0.0.1:8000/docs

### فرانت‌اند

```bash
cd frontend
npm install
npm run dev
```

سایت روی http://localhost:3000 اجرا می‌شود. آدرس API در `.env.local` تنظیم شده است:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## ساختار

```
backend/app/    مدل‌ها، اسکیماها، seed و endpointها
frontend/src/
  app/          صفحات (home, products, products/[slug], cart, checkout, order/[code])
  components/   Header, ProductCard, FilterPanel, CartProvider, ...
  lib/          api، فرمت اعداد و نوع‌ها
```

## API

| مسیر | توضیح |
| --- | --- |
| `GET /api/home` | تخفیف‌ها، جدیدترین و پرفروش‌ها |
| `GET /api/categories` | دسته‌بندی‌ها با تعداد محصول |
| `GET /api/brands?category=` | برندها با تعداد محصول |
| `GET /api/products` | فیلتر: `q, category, brand, min_price, max_price, in_stock, on_sale, sort, page, page_size` |
| `GET /api/products/{slug}` | جزئیات محصول |
| `GET /api/products/{slug}/related` | محصولات مرتبط |
| `POST /api/orders` | ثبت سفارش |
| `GET /api/orders/{code}` | مشاهده سفارش |

## متغیرهای محیطی بک‌اند

- `DATABASE_URL` (پیش‌فرض `sqlite:///./shop.db`)
- `CORS_ORIGINS` (پیش‌فرض localhost:3000، با ویرگول جدا شود)
