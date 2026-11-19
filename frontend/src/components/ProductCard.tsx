import Link from "next/link";
import ProductVisual from "./ProductVisual";
import WishlistButton from "./WishlistButton";
import { fa, faRating, price } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
    const soldOut = product.stock === 0;

    return (
        <div className="relative h-full">
            <Link
                href={`/products/${product.slug}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-slate-900/[.05] transition duration-300 hover:-translate-y-1 hover:shadow-lift active:scale-[.985]"
            >
                <div className="relative aspect-[5/4] overflow-hidden">
                    <div className="h-full w-full transition duration-700 group-hover:scale-110">
                        <ProductVisual
                            kind={product.visual_kind}
                            hue={product.hue}
                        />
                    </div>

                    {product.discount_percent > 0 && !soldOut && (
                        <span className="absolute start-2.5 top-2.5 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 px-2.5 py-1 text-[11px] font-black text-white shadow-lg shadow-coral-500/30">
                            {fa(product.discount_percent)}٪
                        </span>
                    )}

                    <span className="absolute bottom-2.5 end-2.5 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-extrabold backdrop-blur">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="#f59e0b"
                            aria-hidden="true"
                        >
                            <path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.7 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" />
                        </svg>
                        {faRating(product.rating)}
                    </span>

                    {soldOut && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-extrabold text-ink-soft backdrop-blur-[2px]">
                            ناموجود
                        </span>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
                    <p className="text-[11px] font-extrabold tracking-wide text-brand-600">
                        {product.brand.name}
                    </p>
                    <h3 className="line-clamp-2 min-h-[2.9rem] text-[13px] font-bold leading-[1.45rem] text-ink sm:text-sm">
                        {product.name}
                    </h3>

                    <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                        <div className="min-h-[2.6rem]">
                            {product.discount_percent > 0 && !soldOut && (
                                <p className="text-[11px] text-ink-mute line-through">
                                    {price(product.price)}
                                </p>
                            )}
                            {!soldOut && (
                                <p className="text-[15px] font-black sm:text-base">
                                    {price(product.final_price)}
                                    <span className="ms-1 text-[11px] font-semibold text-ink-soft">
                                        تومان
                                    </span>
                                </p>
                            )}
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m15 6-6 6 6 6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>

            <WishlistButton product={product} />
        </div>
    );
}
