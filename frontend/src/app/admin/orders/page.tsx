"use client";

import { useCallback, useEffect, useState } from "react";
import { admin, type OrderPage } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { fa, faDate, price } from "@/lib/format";
import { STATUSES, statusMeta } from "@/lib/status";

export default function AdminOrdersPage() {
    const [data, setData] = useState<OrderPage | null>(null);
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [open, setOpen] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setData(await admin.orders(status, page));
            setError(null);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "خطا در دریافت اطلاعات",
            );
        }
    }, [status, page]);

    useEffect(() => {
        load();
    }, [load]);

    async function change(code: string, next: string) {
        if (
            next === "cancelled" &&
            !window.confirm(
                "سفارش لغو شود؟ موجودی کالاها به انبار برمی‌گردد و این کار قابل بازگشت نیست.",
            )
        ) {
            return;
        }
        setBusy(code);
        try {
            const updated = await admin.setStatus(code, next);
            setData((current) =>
                current
                    ? {
                          ...current,
                          items: current.items.map((o) =>
                              o.code === code ? updated : o,
                          ),
                      }
                    : current,
            );
            setError(null);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "تغییر وضعیت انجام نشد",
            );
        } finally {
            setBusy(null);
        }
    }

    const tabs = [{ value: "", label: "همه", tone: "" }, ...STATUSES];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black">سفارش‌ها</h1>

            <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                            setStatus(tab.value);
                            setPage(1);
                            setOpen(null);
                        }}
                        className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
                            status === tab.value
                                ? "bg-brand-600 text-white"
                                : "bg-white text-ink-soft hover:bg-brand-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <p className="rounded-2xl bg-coral-50 p-4 text-sm font-bold text-coral-600">
                    {error}
                </p>
            )}

            {!data ? (
                <div className="card h-64 animate-pulse" />
            ) : data.items.length === 0 ? (
                <div className="card py-16 text-center text-sm text-ink-soft">
                    سفارشی پیدا نشد
                </div>
            ) : (
                <div className="space-y-3">
                    {data.items.map((order) => {
                        const expanded = open === order.code;
                        const locked = order.status === "cancelled";
                        return (
                            <article
                                key={order.code}
                                className="card overflow-hidden"
                            >
                                <div className="flex flex-wrap items-center gap-4 p-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpen(
                                                expanded ? null : order.code,
                                            )
                                        }
                                        className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-start"
                                    >
                                        <span
                                            dir="ltr"
                                            className="font-black text-brand-700"
                                        >
                                            {order.code}
                                        </span>
                                        <span className="font-bold">
                                            {order.customer_name}
                                        </span>
                                        <span className="text-sm text-ink-soft">
                                            {faDate(order.created_at)}
                                        </span>
                                        <span className="font-black">
                                            {price(order.total)} تومان
                                        </span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${statusMeta(order.status).tone}`}
                                        >
                                            {statusMeta(order.status).label}
                                        </span>
                                        <select
                                            value={order.status}
                                            disabled={
                                                busy === order.code || locked
                                            }
                                            onChange={(event) =>
                                                change(
                                                    order.code,
                                                    event.target.value,
                                                )
                                            }
                                            aria-label="تغییر وضعیت"
                                            className="field !w-auto !py-2"
                                        >
                                            {STATUSES.map((item) => (
                                                <option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {expanded && (
                                    <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 p-5 text-sm">
                                        <dl className="grid gap-3 sm:grid-cols-3">
                                            <div>
                                                <dt className="text-ink-soft">
                                                    شماره تماس
                                                </dt>
                                                <dd
                                                    className="font-bold"
                                                    dir="ltr"
                                                >
                                                    {order.phone}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-ink-soft">
                                                    کد پستی
                                                </dt>
                                                <dd className="font-bold">
                                                    {order.postal_code || "—"}
                                                </dd>
                                            </div>
                                            <div className="sm:col-span-3">
                                                <dt className="text-ink-soft">
                                                    آدرس
                                                </dt>
                                                <dd className="font-bold leading-7">
                                                    {order.city}،{" "}
                                                    {order.address}
                                                </dd>
                                            </div>
                                        </dl>
                                        <ul className="divide-y divide-slate-200 rounded-2xl bg-white">
                                            {order.items.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center justify-between gap-4 p-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-1 font-bold">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="text-xs text-ink-soft">
                                                            {item.color &&
                                                                `${item.color} · `}
                                                            {fa(item.quantity)}{" "}
                                                            عدد
                                                        </p>
                                                    </div>
                                                    <p className="shrink-0 font-black">
                                                        {price(
                                                            item.unit_price *
                                                                item.quantity,
                                                        )}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-ink-soft">
                                            هزینه ارسال:{" "}
                                            {order.shipping_fee === 0
                                                ? "رایگان"
                                                : `${price(order.shipping_fee)} تومان`}
                                        </p>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="btn-ghost !px-4 !py-2"
                    >
                        قبلی
                    </button>
                    <span className="text-sm font-bold text-ink-soft">
                        صفحه {fa(page)} از {fa(data.pages)}
                    </span>
                    <button
                        type="button"
                        disabled={page >= data.pages}
                        onClick={() => setPage((p) => p + 1)}
                        className="btn-ghost !px-4 !py-2"
                    >
                        بعدی
                    </button>
                </div>
            )}
        </div>
    );
}
