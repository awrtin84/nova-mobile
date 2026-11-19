"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { fa, price } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";

export default function AddToCart({ product }: { product: ProductDetail }) {
    const { add, lines } = useCart();
    const [colorIndex, setColorIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const color = product.colors[colorIndex];
    const inCart = lines
        .filter((l) => l.productId === product.id)
        .reduce((sum, l) => sum + l.quantity, 0);
    const limit = Math.min(10, product.stock);
    const room = Math.max(0, limit - inCart);
    const soldOut = product.stock === 0;

    function addToCart() {
        add({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.final_price,
            color: color?.name ?? "",
            stock: product.stock,
            kind: product.visual_kind,
            hue: product.hue,
            quantity: Math.min(quantity, room),
        });
        setQuantity(1);
    }

    return (
        <div className="space-y-6">
            {product.colors.length > 0 && (
                <div>
                    <p className="mb-3 text-sm font-extrabold">
                        رنگ:{" "}
                        <span className="font-semibold text-ink-soft">
                            {color?.name}
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {product.colors.map((item, index) => (
                            <button
                                key={item.name}
                                type="button"
                                onClick={() => setColorIndex(index)}
                                aria-label={item.name}
                                aria-pressed={index === colorIndex}
                                className={`h-11 w-11 rounded-full border-2 border-white shadow-card transition ${
                                    index === colorIndex
                                        ? "scale-110 ring-[3px] ring-brand-500"
                                        : "ring-1 ring-slate-900/10"
                                }`}
                                style={{ backgroundColor: item.hex }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {soldOut ? (
                <div className="rounded-2xl bg-slate-100 px-5 py-4 text-center text-sm font-extrabold text-ink-soft">
                    این کالا در حال حاضر ناموجود است
                </div>
            ) : (
                <>
                    {product.stock <= 5 && (
                        <p className="flex items-center gap-2 rounded-2xl bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-coral-500" />
                            تنها {fa(product.stock)} عدد در انبار باقی مانده
                        </p>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-2xl bg-slate-900/[.05] p-1">
                            <button
                                type="button"
                                aria-label="کاهش تعداد"
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className="h-11 w-11 rounded-xl text-xl font-bold text-ink-soft transition hover:bg-white hover:text-brand-700"
                            >
                                −
                            </button>
                            <span className="w-10 text-center font-black">
                                {fa(Math.min(quantity, Math.max(room, 1)))}
                            </span>
                            <button
                                type="button"
                                aria-label="افزایش تعداد"
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.min(Math.max(room, 1), q + 1),
                                    )
                                }
                                className="h-11 w-11 rounded-xl text-xl font-bold text-ink-soft transition hover:bg-white hover:text-brand-700"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            disabled={room === 0}
                            onClick={addToCart}
                            className="btn-primary hidden flex-1 !py-4 md:inline-flex"
                        >
                            {room === 0
                                ? "به سقف موجودی رسیدید"
                                : "افزودن به سبد خرید"}
                        </button>
                    </div>

                    {inCart > 0 && (
                        <Link
                            href="/cart"
                            className="block text-sm font-bold text-brand-600 hover:text-brand-800"
                        >
                            {fa(inCart)} عدد از این کالا در سبد شماست؛ مشاهده
                            سبد ←
                        </Link>
                    )}

                    <div
                        className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
                        style={{
                            paddingBottom:
                                "calc(env(safe-area-inset-bottom) + 0.75rem)",
                        }}
                    >
                        <div className="mx-auto flex max-w-md items-center gap-3 rounded-[1.75rem] bg-night/90 p-3 ps-5 shadow-dock ring-1 ring-white/10 backdrop-blur-2xl">
                            <div className="min-w-0 flex-1 text-white">
                                {product.discount_percent > 0 && (
                                    <p className="text-[11px] text-white/50 line-through">
                                        {price(product.price)}
                                    </p>
                                )}
                                <p className="text-lg font-black leading-6">
                                    {price(product.final_price)}{" "}
                                    <span className="text-[11px] font-semibold text-white/60">
                                        تومان
                                    </span>
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={room === 0}
                                onClick={addToCart}
                                className="btn-coral !px-6"
                            >
                                {room === 0 ? "سقف موجودی" : "افزودن به سبد"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
