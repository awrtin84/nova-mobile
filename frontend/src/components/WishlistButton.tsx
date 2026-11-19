"use client";

import { useWishlist } from "./WishlistProvider";
import type { Product } from "@/lib/types";

export default function WishlistButton({ product }: { product: Product }) {
    const { has, toggle, ready } = useWishlist();
    const active = ready && has(product.id);

    return (
        <button
            type="button"
            aria-label={
                active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
            }
            aria-pressed={active}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggle(product);
            }}
            className={`absolute end-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition active:scale-90 ${
                active
                    ? "bg-coral-500 text-white shadow-lg shadow-coral-500/30"
                    : "bg-white/80 text-ink-soft hover:text-coral-600"
            }`}
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={active ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.700 3.700 4.500 7 4.500c2 0 3.600 1.100 5 3 1.400-1.900 3-3 5-3 3.300 0 5.400 3.200 4.200 6.600-1.700 4.800-9.200 9.400-9.200 9.400z" />
            </svg>
        </button>
    );
}
