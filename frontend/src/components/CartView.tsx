"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import OrderSummary from "./OrderSummary";
import ProductVisual from "./ProductVisual";
import { fa, price } from "@/lib/format";
import type { Config } from "@/lib/types";

export default function CartView({ config }: { config: Config }) {
  const { lines, ready, subtotal, setQuantity, remove, clear } = useCart();

  if (!ready) {
    return <div className="card h-64 animate-pulse" />;
  }

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 7h13l-1.5 9h-10z" />
            <path d="M6 7 5 3H2" />
            <circle cx="9" cy="20" r="1.3" />
            <circle cx="17" cy="20" r="1.3" />
          </svg>
        </span>
        <p className="text-xl font-black">سبد خرید شما خالی است</p>
        <p className="text-sm text-ink-soft">برای شروع خرید، محصولات مورد نظرتان را به سبد اضافه کنید.</p>
        <Link href="/products" className="btn-primary mt-2">
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-soft">{fa(lines.length)} ردیف در سبد</p>
          <button type="button" onClick={clear} className="text-sm font-bold text-coral-600 hover:underline">
            خالی کردن سبد
          </button>
        </div>

        {lines.map((line) => (
          <article key={line.key} className="card flex gap-4 p-4">
            <Link
              href={`/products/${line.slug}`}
              className="block h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28"
            >
              <ProductVisual kind={line.kind} hue={line.hue} />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/products/${line.slug}`}
                    className="line-clamp-2 text-sm font-bold leading-6 hover:text-brand-700"
                  >
                    {line.name}
                  </Link>
                  {line.color && <p className="mt-1 text-xs font-semibold text-ink-soft">رنگ: {line.color}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.key)}
                  aria-label="حذف از سبد"
                  className="shrink-0 rounded-xl p-2 text-ink-mute transition hover:bg-coral-50 hover:text-coral-600"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                  </svg>
                </button>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-xl border border-slate-200">
                  <button
                    type="button"
                    aria-label="کاهش تعداد"
                    onClick={() => setQuantity(line.key, line.quantity - 1)}
                    className="h-9 w-9 font-bold text-ink-soft hover:text-brand-700"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-black">{fa(line.quantity)}</span>
                  <button
                    type="button"
                    aria-label="افزایش تعداد"
                    onClick={() => setQuantity(line.key, line.quantity + 1)}
                    className="h-9 w-9 font-bold text-ink-soft hover:text-brand-700"
                  >
                    +
                  </button>
                </div>
                <p className="text-base font-black">
                  {price(line.price * line.quantity)} <span className="text-xs font-semibold text-ink-soft">تومان</span>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <OrderSummary subtotal={subtotal} config={config}>
        <Link href="/checkout" className="btn-primary w-full !py-3.5">
          ادامه فرایند خرید
        </Link>
      </OrderSummary>
    </div>
  );
}
