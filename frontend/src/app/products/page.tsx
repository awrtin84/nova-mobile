import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import FilterPanel from "@/components/FilterPanel";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import SortBar from "@/components/SortBar";
import { api } from "@/lib/api";
import { fa } from "@/lib/format";

export const metadata: Metadata = { title: "محصولات" };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const brand =
        params.brand === undefined
            ? []
            : Array.isArray(params.brand)
              ? params.brand
              : [params.brand];
    const category = first(params.category);

    const [result, categories, brands] = await Promise.all([
        api.products({
            q: first(params.q),
            category,
            brand,
            min_price: first(params.min_price),
            max_price: first(params.max_price),
            in_stock: first(params.in_stock),
            on_sale: first(params.on_sale),
            sort: first(params.sort),
            page: first(params.page),
        }),
        api.categories(),
        api.brands(category),
    ]);

    const activeCategory = categories.find((item) => item.slug === category);
    const query = first(params.q);

    return (
        <div className="container-page py-4 md:py-8">
            <nav
                aria-label="مسیر"
                className="mb-5 hidden items-center gap-2 text-sm text-ink-soft md:flex"
            >
                <Link href="/" className="hover:text-brand-700">
                    خانه
                </Link>
                <span>/</span>
                <span className="font-bold text-ink">
                    {activeCategory ? activeCategory.name : "همه محصولات"}
                </span>
            </nav>

            <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
                <h1 className="text-[1.6rem] font-black leading-tight md:text-3xl">
                    {query
                        ? `نتایج «${query}»`
                        : activeCategory
                          ? activeCategory.name
                          : "همه محصولات"}
                </h1>
                <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-ink-soft ring-1 ring-slate-900/[.06]">
                    {fa(result.total)} کالا
                </span>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-[18rem_1fr] lg:gap-6">
                <Suspense fallback={null}>
                    <FilterPanel categories={categories} brands={brands} />
                </Suspense>

                <div className="min-w-0">
                    <Suspense fallback={null}>
                        <SortBar />
                    </Suspense>

                    {result.items.length === 0 ? (
                        <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                                <svg
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.9"
                                    strokeLinecap="round"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-3.5-3.5" />
                                </svg>
                            </span>
                            <p className="text-lg font-black">
                                کالایی با این مشخصات پیدا نشد
                            </p>
                            <p className="text-sm text-ink-soft">
                                فیلترها را تغییر دهید یا عبارت جستجو را ساده‌تر
                                کنید.
                            </p>
                            <Link href="/products" className="btn-primary mt-2">
                                نمایش همه محصولات
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                            {result.items.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}

                    <Pagination
                        page={result.page}
                        pages={result.pages}
                        params={params}
                    />
                </div>
            </div>
        </div>
    );
}
