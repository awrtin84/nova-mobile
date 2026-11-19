"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { admin } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { fa, price } from "@/lib/format";
import type { ProductPage } from "@/lib/types";

export default function AdminProductsPage() {
    const [data, setData] = useState<ProductPage | null>(null);
    const [query, setQuery] = useState("");
    const [applied, setApplied] = useState("");
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            setData(await admin.products(applied, page));
            setError(null);
        } catch (err) {
            setError(
                err instanceof ApiError ? err.message : "خطا در دریافت اطلاعات",
            );
        }
    }, [applied, page]);

    useEffect(() => {
        load();
    }, [load]);

    async function remove(id: number, name: string) {
        if (!window.confirm(`«${name}» حذف شود؟`)) return;
        setBusyId(id);
        try {
            await admin.deleteProduct(id);
            await load();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "حذف انجام نشد");
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-black">محصولات</h1>
                <Link href="/admin/products/new" className="btn-primary">
                    افزودن محصول
                </Link>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setPage(1);
                    setApplied(query.trim());
                }}
                className="flex gap-2"
            >
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="جستجوی نام محصول…"
                    className="field max-w-md"
                />
                <button type="submit" className="btn-ghost">
                    جستجو
                </button>
            </form>

            {error && (
                <p className="rounded-2xl bg-coral-50 p-4 text-sm font-bold text-coral-600">
                    {error}
                </p>
            )}

            {!data ? (
                <div className="card h-64 animate-pulse" />
            ) : data.items.length === 0 ? (
                <div className="card py-16 text-center text-sm text-ink-soft">
                    محصولی پیدا نشد
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full min-w-[44rem] text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-start text-xs font-extrabold text-ink-soft">
                                <th className="px-4 py-3 text-start">محصول</th>
                                <th className="px-4 py-3 text-start">دسته</th>
                                <th className="px-4 py-3 text-start">
                                    قیمت نهایی
                                </th>
                                <th className="px-4 py-3 text-start">تخفیف</th>
                                <th className="px-4 py-3 text-start">موجودی</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((product) => (
                                <tr
                                    key={product.id}
                                    className="transition hover:bg-slate-50"
                                >
                                    <td className="max-w-xs px-4 py-3">
                                        <p className="line-clamp-1 font-bold">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-ink-soft">
                                            {product.brand.name}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-ink-soft">
                                        {product.category.name}
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        {price(product.final_price)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.discount_percent
                                            ? `${fa(product.discount_percent)}٪`
                                            : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                                                product.stock === 0
                                                    ? "bg-rose-100 text-rose-800"
                                                    : product.stock <= 5
                                                      ? "bg-amber-100 text-amber-800"
                                                      : "bg-emerald-100 text-emerald-800"
                                            }`}
                                        >
                                            {fa(product.stock)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="rounded-xl px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
                                            >
                                                ویرایش
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={busyId === product.id}
                                                onClick={() =>
                                                    remove(
                                                        product.id,
                                                        product.name,
                                                    )
                                                }
                                                className="rounded-xl px-3 py-1.5 text-xs font-bold text-coral-600 transition hover:bg-coral-50 disabled:opacity-50"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
