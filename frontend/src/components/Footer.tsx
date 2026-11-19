import Link from "next/link";
import type { Category } from "@/lib/types";

const perks = [
    { title: "ارسال سریع", text: "ارسال به سراسر کشور" },
    { title: "ضمانت اصالت", text: "کالای اصل با گارانتی" },
    { title: "پرداخت امن", text: "پرداخت در محل" },
    { title: "مشاوره خرید", text: "پاسخگویی همه روزه" },
];

export default function Footer({ categories }: { categories: Category[] }) {
    return (
        <footer className="mt-16 md:mt-24">
            <div className="relative overflow-hidden rounded-t-[2.5rem] bg-night text-white">
                <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -start-16 h-64 w-64 rounded-full bg-coral-500/20 blur-3xl" />

                <div className="container-page relative grid grid-cols-2 gap-3 py-8 md:grid-cols-4 md:py-10">
                    {perks.map((perk) => (
                        <div
                            key={perk.title}
                            className="rounded-3xl bg-white/[.06] p-4 ring-1 ring-white/10 md:p-5"
                        >
                            <span className="mb-3 block h-1.5 w-8 rounded-full bg-gradient-to-l from-brand-400 to-coral-400" />
                            <p className="text-sm font-extrabold">
                                {perk.title}
                            </p>
                            <p className="mt-1 text-xs text-white/60">
                                {perk.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="container-page relative grid gap-8 border-t border-white/10 py-10 md:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-coral-500 font-black">
                                N
                            </span>
                            <p className="text-lg font-black">نوا موبایل</p>
                        </div>
                        <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
                            فروشگاه آنلاین موبایل و لوازم جانبی؛ این پروژه
                            نمونه‌کار با Next.js و FastAPI ساخته شده است و
                            محصولات و قیمت‌ها نمایشی هستند.
                        </p>
                    </div>

                    <div>
                        <p className="font-extrabold">دسته‌بندی‌ها</p>
                        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-white/60">
                            {categories.map((category) => (
                                <li key={category.slug}>
                                    <Link
                                        href={`/products?category=${category.slug}`}
                                        className="transition hover:text-white"
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-extrabold">دسترسی سریع</p>
                        <ul className="mt-4 space-y-2.5 text-sm text-white/60">
                            <li>
                                <Link
                                    href="/products"
                                    className="transition hover:text-white"
                                >
                                    همه محصولات
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cart"
                                    className="transition hover:text-white"
                                >
                                    سبد خرید
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/wishlist"
                                    className="transition hover:text-white"
                                >
                                    علاقه‌مندی‌ها
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/track"
                                    className="transition hover:text-white"
                                >
                                    پیگیری سفارش
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/products?on_sale=true&sort=discount"
                                    className="transition hover:text-white"
                                >
                                    تخفیف‌های ویژه
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help"
                                    className="transition hover:text-white"
                                >
                                    راهنما و پرسش‌های متداول
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="relative border-t border-white/10 pb-32 pt-5 text-center text-xs text-white/40 md:pb-6">
                    نوا موبایل · پروژه نمونه‌کار
                </div>
            </div>
        </footer>
    );
}
