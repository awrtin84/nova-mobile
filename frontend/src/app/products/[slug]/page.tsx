import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductVisual from "@/components/ProductVisual";
import { ApiError, api } from "@/lib/api";
import { fa, faRating, price } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<ProductDetail> {
    try {
        return await api.product(slug);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const product = await api.product(slug);
        return { title: product.name, description: product.description };
    } catch {
        return { title: "محصول" };
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const [product, related, config] = await Promise.all([
        load(slug),
        api.related(slug),
        api.config(),
    ]);
    const entries = Object.entries(product.specs);
    const soldOut = product.stock === 0;

    return (
        <div className="container-page py-4 md:py-8">
            <nav
                aria-label="مسیر"
                className="mb-6 hidden flex-wrap items-center gap-2 text-sm text-ink-soft md:flex"
            >
                <Link href="/" className="hover:text-brand-700">
                    خانه
                </Link>
                <span>/</span>
                <Link
                    href={`/products?category=${product.category.slug}`}
                    className="hover:text-brand-700"
                >
                    {product.category.name}
                </Link>
                <span>/</span>
                <Link
                    href={`/products?brand=${product.brand.slug}`}
                    className="hover:text-brand-700"
                >
                    {product.brand.name}
                </Link>
            </nav>

            <div className="grid gap-5 md:gap-8 lg:grid-cols-2">
                <div className="relative overflow-hidden rounded-[2rem] shadow-card ring-1 ring-slate-900/[.05]">
                    <div className="aspect-[5/4] lg:aspect-[9/8]">
                        <ProductVisual
                            kind={product.visual_kind}
                            hue={product.hue}
                        />
                    </div>
                    <Link
                        href={`/products?brand=${product.brand.slug}`}
                        className="absolute start-3 top-3 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-extrabold text-brand-700 backdrop-blur"
                    >
                        {product.brand.name}
                    </Link>
                    {product.discount_percent > 0 && !soldOut && (
                        <span className="absolute end-3 top-3 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 px-3.5 py-1.5 text-xs font-black text-white shadow-lg shadow-coral-500/30">
                            {fa(product.discount_percent)}٪ تخفیف
                        </span>
                    )}
                </div>

                <div className="space-y-5">
                    <div>
                        <h1 className="text-xl font-black leading-9 sm:text-2xl">
                            {product.name}
                        </h1>
                        <p
                            dir="ltr"
                            className="mt-1 text-start text-sm font-semibold text-ink-mute"
                        >
                            {product.name_en}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-card ring-1 ring-slate-900/[.05]">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="#f59e0b"
                                aria-hidden="true"
                            >
                                <path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.7 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" />
                            </svg>
                            {faRating(product.rating)} (
                            {fa(product.reviews_count)} نظر)
                        </span>
                        <span className="rounded-full bg-white px-3.5 py-2 text-ink-soft shadow-card ring-1 ring-slate-900/[.05]">
                            {fa(product.sold_count)} فروش
                        </span>
                        <span
                            className={`rounded-full px-3.5 py-2 ${
                                soldOut
                                    ? "bg-coral-50 text-coral-600"
                                    : "bg-emerald-50 text-emerald-700"
                            }`}
                        >
                            {soldOut ? "ناموجود" : "موجود در انبار"}
                        </span>
                    </div>

                    <div className="card p-5">
                        {!soldOut && (
                            <div className="mb-5 hidden items-end justify-between gap-3 md:flex">
                                <div>
                                    {product.discount_percent > 0 && (
                                        <p className="text-sm text-ink-mute line-through">
                                            {price(product.price)}
                                        </p>
                                    )}
                                    <p className="mt-1 text-3xl font-black">
                                        {price(product.final_price)}{" "}
                                        <span className="text-sm font-semibold text-ink-soft">
                                            تومان
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                        <AddToCart product={product} />
                        <p className="mt-5 rounded-2xl bg-brand-50/70 px-4 py-3 text-xs leading-6 text-brand-800">
                            ارسال رایگان برای خریدهای بالای{" "}
                            {price(config.free_shipping_threshold)} تومان؛ هزینه
                            ارسال برای سایر سفارش‌ها{" "}
                            {price(config.shipping_fee)} تومان است.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-4 md:mt-10 md:gap-6 lg:grid-cols-[1fr_1.2fr]">
                <section className="card p-5 md:p-6">
                    <h2 className="mb-3 flex items-center gap-2.5 text-lg font-black">
                        <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-coral-500" />
                        معرفی
                    </h2>
                    <p className="leading-8 text-ink-soft">
                        {product.description}
                    </p>
                </section>

                <section className="card p-5 md:p-6">
                    <h2 className="mb-3 flex items-center gap-2.5 text-lg font-black">
                        <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-coral-500" />
                        مشخصات فنی
                    </h2>
                    <dl>
                        {entries.map(([key, value], index) => (
                            <div
                                key={key}
                                className={`grid grid-cols-[7.5rem_1fr] gap-4 rounded-2xl px-3 py-3 text-sm sm:grid-cols-[9rem_1fr] ${
                                    index % 2 === 0 ? "bg-slate-900/[.03]" : ""
                                }`}
                            >
                                <dt className="font-semibold text-ink-soft">
                                    {key}
                                </dt>
                                <dd className="font-bold">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>

            {related.length > 0 && (
                <section className="mt-12 md:mt-14">
                    <h2 className="mb-4 flex items-center gap-3 text-xl font-black">
                        <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-coral-500" />
                        کالاهای مرتبط
                    </h2>
                    <div className="snap-rail md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-5">
                        {related.map((item) => (
                            <div
                                key={item.id}
                                className="w-[44vw] max-w-[210px] md:w-auto md:max-w-none"
                            >
                                <ProductCard product={item} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
