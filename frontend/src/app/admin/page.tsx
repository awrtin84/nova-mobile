"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { admin, type Stats } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { fa, faDate, price } from "@/lib/format";
import { STATUSES, statusMeta } from "@/lib/status";

function StatCard({
    label,
    value,
    hint,
    tone,
}: {
    label: string;
    value: string;
    hint?: string;
    tone: string;
}) {
    return (
        <div className="card p-5">
            <span
                className={`inline-block rounded-xl px-3 py-1 text-xs font-extrabold ${tone}`}
            >
                {label}
            </span>
            <p className="mt-4 text-2xl font-black">{value}</p>
            {hint && (
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                    {hint}
                </p>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        admin
            .stats()
            .then(setStats)
            .catch((err) =>
                setError(
                    err instanceof ApiError
                        ? err.message
                        : "خطا در دریافت اطلاعات",
                ),
            );
    }, []);

    if (error)
        return (
            <p className="rounded-2xl bg-coral-50 p-5 text-sm font-bold text-coral-600">
                {error}
            </p>
        );
    if (!stats) return <div className="card h-64 animate-pulse" />;

    const peak = Math.max(1, ...stats.daily.map((d) => d.revenue));

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-black">داشبورد</h1>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    label="فروش کل"
                    value={`${price(stats.revenue)} تومان`}
                    hint="بدون سفارش‌های لغوشده"
                    tone="bg-brand-100 text-brand-800"
                />
                <StatCard
                    label="سفارش‌ها"
                    value={fa(stats.orders)}
                    hint={`${fa(stats.pending)} سفارش در انتظار تأیید`}
                    tone="bg-sky-100 text-sky-800"
                />
                <StatCard
                    label="محصولات"
                    value={fa(stats.products)}
                    tone="bg-emerald-100 text-emerald-800"
                />
                <StatCard
                    label="ناموجود"
                    value={fa(stats.out_of_stock)}
                    hint="کالاهای با موجودی صفر"
                    tone="bg-rose-100 text-rose-800"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <section className="card p-6">
                    <h2 className="mb-6 text-lg font-black">فروش ۷ روز اخیر</h2>
                    <div className="flex h-48 items-end gap-3">
                        {stats.daily.map((day) => (
                            <div
                                key={day.date}
                                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                            >
                                <span className="text-[10px] font-bold text-ink-mute">
                                    {day.revenue > 0
                                        ? fa(
                                              Math.round(
                                                  day.revenue / 1_000_000,
                                              ),
                                          ) + "م"
                                        : ""}
                                </span>
                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-brand-300 transition-all"
                                    style={{
                                        height: `${Math.max(4, (day.revenue / peak) * 100)}%`,
                                        opacity: day.revenue > 0 ? 1 : 0.25,
                                    }}
                                    title={`${price(day.revenue)} تومان · ${fa(day.orders)} سفارش`}
                                />
                                <span className="text-xs font-semibold text-ink-soft">
                                    {new Date(
                                        `${day.date}T00:00:00`,
                                    ).toLocaleDateString("fa-IR", {
                                        weekday: "short",
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="card p-6">
                    <h2 className="mb-4 text-lg font-black">وضعیت سفارش‌ها</h2>
                    <ul className="space-y-3">
                        {STATUSES.map((item) => (
                            <li
                                key={item.value}
                                className="flex items-center justify-between text-sm"
                            >
                                <span
                                    className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${item.tone}`}
                                >
                                    {item.label}
                                </span>
                                <span className="font-black">
                                    {fa(stats.by_status[item.value] ?? 0)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="card p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-black">آخرین سفارش‌ها</h2>
                        <Link
                            href="/admin/orders"
                            className="text-sm font-bold text-brand-600"
                        >
                            همه ←
                        </Link>
                    </div>
                    {stats.recent_orders.length === 0 ? (
                        <p className="py-6 text-center text-sm text-ink-soft">
                            هنوز سفارشی ثبت نشده است
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats.recent_orders.map((order) => (
                                <li
                                    key={order.code}
                                    className="flex items-center justify-between gap-3 py-3 text-sm"
                                >
                                    <div className="min-w-0">
                                        <p className="font-bold">
                                            {order.customer_name}
                                        </p>
                                        <p className="text-xs text-ink-soft">
                                            {faDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <p className="font-black">
                                            {price(order.total)}
                                        </p>
                                        <span
                                            className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-[11px] font-extrabold ${statusMeta(order.status).tone}`}
                                        >
                                            {statusMeta(order.status).label}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-black">کمبود موجودی</h2>
                        <Link
                            href="/admin/products"
                            className="text-sm font-bold text-brand-600"
                        >
                            محصولات ←
                        </Link>
                    </div>
                    {stats.low_stock.length === 0 ? (
                        <p className="py-6 text-center text-sm text-ink-soft">
                            کالایی با موجودی کم وجود ندارد
                        </p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {stats.low_stock.map((product) => (
                                <li
                                    key={product.id}
                                    className="flex items-center justify-between gap-3 py-3 text-sm"
                                >
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        className="line-clamp-1 font-bold hover:text-brand-700"
                                    >
                                        {product.name}
                                    </Link>
                                    <span className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                                        {fa(product.stock)} عدد
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
