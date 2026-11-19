import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

type Props = {
    title: string;
    subtitle?: string;
    href?: string;
    products: Product[];
};

export default function ProductRail({
    title,
    subtitle,
    href,
    products,
}: Props) {
    if (products.length === 0) return null;

    return (
        <section className="container-page mt-10 md:mt-14">
            <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
                <div className="flex items-center gap-3">
                    <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand-500 to-coral-500" />
                    <div>
                        <h2 className="text-lg font-black sm:text-2xl">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-ink-soft sm:text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {href && (
                    <Link
                        href={href}
                        className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-brand-700 ring-1 ring-slate-900/[.06] transition hover:bg-brand-50"
                    >
                        همه ←
                    </Link>
                )}
            </div>

            <div className="snap-rail md:grid md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                {products.slice(0, 8).map((product) => (
                    <div
                        key={product.id}
                        className="w-[44vw] max-w-[210px] md:w-auto md:max-w-none"
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
}
