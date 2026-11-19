import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "راهنما و پرسش‌های متداول" };

const groups = [
    {
        title: "ارسال و تحویل",
        items: [
            {
                q: "ارسال سفارش چقدر زمان می‌برد؟",
                a: "سفارش‌های ثبت‌شده تا ساعت ۱۴ همان روز آماده ارسال می‌شوند و معمولاً بین ۲ تا ۵ روز کاری به دستتان می‌رسند.",
            },
            {
                q: "هزینه ارسال چقدر است؟",
                a: "برای خریدهای بالای ۵ میلیون تومان ارسال رایگان است و برای سفارش‌های کمتر، هزینه ارسال ۱۵۰ هزار تومان محاسبه می‌شود.",
            },
            {
                q: "چطور سفارشم را پیگیری کنم؟",
                a: "از بخش پیگیری سفارش، کد سفارش را که بعد از ثبت دریافت کرده‌اید وارد کنید تا وضعیت لحظه‌ای را ببینید.",
            },
        ],
    },
    {
        title: "پرداخت",
        items: [
            {
                q: "روش‌های پرداخت چیست؟",
                a: "در این نسخه نمایشی، پرداخت در محل انجام می‌شود و درگاه پرداخت آنلاین فعال نیست.",
            },
            {
                q: "آیا قیمت‌ها نهایی هستند؟",
                a: "قیمت نهایی هر کالا در سبد خرید و هنگام ثبت سفارش دوباره توسط سرور محاسبه می‌شود.",
            },
        ],
    },
    {
        title: "گارانتی و مرجوعی",
        items: [
            {
                q: "کالاها گارانتی دارند؟",
                a: "همه گوشی‌ها و لوازم جانبی اصل هستند و با گارانتی معتبر عرضه می‌شوند؛ جزئیات هر کالا در صفحه محصول آمده است.",
            },
            {
                q: "امکان مرجوع کردن کالا هست؟",
                a: "تا ۷ روز پس از تحویل، در صورت سالم بودن بسته‌بندی و عدم استفاده، کالا قابل مرجوع است.",
            },
        ],
    },
];

export default function HelpPage() {
    return (
        <div className="container-page py-4 md:py-8">
            <div className="hero-night relative mb-6 overflow-hidden rounded-[2rem] px-6 py-9 text-white shadow-lift md:mb-8 md:px-12 md:py-12">
                <h1 className="text-2xl font-black md:text-4xl">
                    راهنما و پرسش‌های متداول
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                    جواب رایج‌ترین سوال‌ها درباره خرید، ارسال و گارانتی اینجاست.
                    اگر چیزی پیدا نکردید، با ما تماس بگیرید.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
                <div className="space-y-6">
                    {groups.map((group) => (
                        <section key={group.title}>
                            <h2 className="mb-3 flex items-center gap-2.5 text-lg font-black">
                                <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-coral-500" />
                                {group.title}
                            </h2>
                            <div className="space-y-2.5">
                                {group.items.map((item) => (
                                    <details
                                        key={item.q}
                                        className="card group px-5 py-4"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold">
                                            {item.q}
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-open:rotate-45">
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.6"
                                                    strokeLinecap="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 5v14M5 12h14" />
                                                </svg>
                                            </span>
                                        </summary>
                                        <p className="mt-3 text-sm leading-7 text-ink-soft">
                                            {item.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <aside className="card space-y-4 p-5 lg:sticky lg:top-28">
                    <h2 className="text-lg font-black">تماس با ما</h2>
                    <ul className="space-y-3 text-sm text-ink-soft">
                        <li>
                            <span className="block text-xs text-ink-mute">
                                تلفن
                            </span>
                            <span
                                dir="ltr"
                                className="block text-start font-bold text-ink"
                            >
                                ۰۶۶-۰۰۰۰۰۰۰۰
                            </span>
                        </li>
                        <li>
                            <span className="block text-xs text-ink-mute">
                                ساعت پاسخگویی
                            </span>
                            <span className="font-bold text-ink">
                                همه روزه ۹ تا ۲۱
                            </span>
                        </li>
                        <li>
                            <span className="block text-xs text-ink-mute">
                                آدرس
                            </span>
                            <span className="font-bold text-ink">خرم‌آباد</span>
                        </li>
                    </ul>
                    <Link href="/track" className="btn-primary w-full">
                        پیگیری سفارش
                    </Link>
                </aside>
            </div>
        </div>
    );
}
