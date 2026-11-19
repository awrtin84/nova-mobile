"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/components/WishlistProvider";
import { fa } from "@/lib/format";

export default function WishlistPage() {
    const { items, ready } = useWishlist();

    return (
        <div className="container-page py-4 md:py-8">
            <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
                <h1 className="text-[1.6rem] font-black leading-tight md:text-3xl">
                    علاقه‌مندی‌ها
                </h1>
                {ready && items.length > 0 && (
                    <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-extrabold text-ink-soft ring-1 ring-slate-900/[.06]">
                        {fa(items.length)} کالا
                    </span>
                )}
            </div>

            {!ready ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="skeleton h-64 rounded-[1.75rem]"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="card flex flex-col items-center gap-3 px-6 py-20 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-coral-50 text-coral-500">
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.700 3.700 4.500 7 4.500c2 0 3.600 1.100 5 3 1.400-1.900 3-3 5-3 3.300 0 5.400 3.200 4.200 6.600-1.700 4.800-9.200 9.400-9.200 9.400z" />
                        </svg>
                    </span>
                    <p className="text-lg font-black">
                        هنوز کالایی ذخیره نکرده‌اید
                    </p>
                    <p className="text-sm text-ink-soft">
                        روی قلب کارت هر محصول بزنید تا اینجا نگهش دارید.
                    </p>
                    <Link href="/products" className="btn-primary mt-2">
                        دیدن محصولات
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
