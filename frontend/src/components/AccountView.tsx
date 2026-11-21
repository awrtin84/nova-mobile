"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Tilt from "./Tilt";
import { useUser } from "./UserProvider";
import { useWishlist } from "./WishlistProvider";
import { ApiError } from "@/lib/api";
import { fa, faDate, price } from "@/lib/format";
import { haptic } from "@/lib/haptic";
import { statusMeta } from "@/lib/status";
import type { Order } from "@/lib/types";
import { toFa, userApi } from "@/lib/user-api";

export default function AccountView() {
    const router = useRouter();
    const { user, token, ready, logout, setUser } = useUser();
    const { items } = useWishlist();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (ready && !user) router.replace("/login?next=/account");
    }, [ready, user, router]);

    useEffect(() => {
        if (!token) return;
        userApi
            .orders(token)
            .then(setOrders)
            .catch(() => setOrders([]));
    }, [token]);

    if (!ready || !user) {
        return (
            <div className="container-page py-20">
                <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-4xl bg-slate-900/[.06]" />
            </div>
        );
    }

    async function save(event: React.FormEvent) {
        event.preventDefault();
        const clean = name.trim();
        if (clean.length < 2 || !token) return;
        setSaving(true);
        setError("");
        try {
            setUser(await userApi.updateName(token, clean));
            setEditing(false);
            haptic(12);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "ذخیره نام انجام نشد");
        } finally {
            setSaving(false);
        }
    }

    function exit() {
        logout();
        haptic([10, 40, 10]);
        router.replace("/");
    }

    const initial = (user.name || "ن").trim().charAt(0);
    const spent = (orders ?? [])
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0);

    return (
        <div className="container-page py-6 pb-32 md:py-10">
            <div className="mx-auto max-w-4xl space-y-6">
                <Tilt max={4}>
                    <section className="hero-night relative overflow-hidden rounded-4xl p-6 text-white md:p-9">
                        <div className="grid-floor opacity-40" />
                        <div className="relative flex flex-wrap items-center gap-5">
                            <span className="z-pop-2 flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-coral-400 to-coral-600 text-3xl font-black text-white shadow-glow ring-1 ring-white/30">
                                {initial}
                            </span>
                            <div className="min-w-0 flex-1">
                                {editing ? (
                                    <form
                                        onSubmit={save}
                                        className="flex flex-wrap items-center gap-2"
                                    >
                                        <input
                                            autoFocus
                                            value={name}
                                            onChange={(event) =>
                                                setName(event.target.value)
                                            }
                                            maxLength={60}
                                            placeholder="نام و نام خانوادگی"
                                            className="min-w-0 flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-[16px] font-bold text-white outline-none placeholder:text-white/40 focus:border-coral-400"
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                saving || name.trim().length < 2
                                            }
                                            className="btn-coral !px-5 !py-3"
                                        >
                                            ذخیره
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditing(false)}
                                            className="rounded-2xl px-3 py-3 text-sm font-bold text-white/70"
                                        >
                                            انصراف
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <h1 className="truncate text-2xl font-black md:text-3xl">
                                            {user.name || "کاربر نوا"}
                                        </h1>
                                        <p
                                            dir="ltr"
                                            className="mt-1 text-start text-sm font-bold tracking-wide text-white/70"
                                        >
                                            {toFa(user.phone)}
                                        </p>
                                    </>
                                )}
                                {error && (
                                    <p className="mt-2 text-sm font-bold text-coral-100">
                                        {error}
                                    </p>
                                )}
                            </div>
                            {!editing && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setName(user.name);
                                        setEditing(true);
                                    }}
                                    className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-extrabold ring-1 ring-white/20 transition hover:bg-white/20"
                                >
                                    ویرایش نام
                                </button>
                            )}
                        </div>

                        <div className="relative mt-7 grid grid-cols-3 gap-3">
                            {[
                                {
                                    label: "سفارش‌ها",
                                    value: fa(orders?.length ?? 0),
                                },
                                {
                                    label: "علاقه‌مندی",
                                    value: fa(items.length),
                                },
                                {
                                    label: "مجموع خرید",
                                    value: `${price(spent)}`,
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="z-pop-1 rounded-2xl bg-white/10 px-3 py-3.5 text-center ring-1 ring-white/15 backdrop-blur"
                                >
                                    <p className="truncate text-lg font-black md:text-xl">
                                        {item.value}
                                    </p>
                                    <p className="mt-0.5 text-[11px] font-bold text-white/60">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </Tilt>

                <section className="card p-5 md:p-7">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-black">سفارش‌های من</h2>
                        <Link
                            href="/track"
                            className="text-sm font-bold text-brand-600 hover:text-brand-800"
                        >
                            پیگیری با کد سفارش
                        </Link>
                    </div>

                    {orders === null ? (
                        <div className="space-y-3">
                            {[0, 1].map((key) => (
                                <div
                                    key={key}
                                    className="h-20 animate-pulse rounded-2xl bg-slate-900/[.05]"
                                />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="rounded-2xl bg-slate-900/[.04] px-5 py-10 text-center">
                            <p className="font-extrabold">
                                هنوز سفارشی ثبت نکرده‌ای
                            </p>
                            <p className="mt-1 text-sm text-ink-soft">
                                سفارش‌هایی که با همین شماره ثبت کنی اینجا نمایش
                                داده می‌شود.
                            </p>
                            <Link
                                href="/products"
                                className="btn-primary mt-5 inline-flex"
                            >
                                مشاهده محصولات
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {orders.map((order) => {
                                const meta = statusMeta(order.status);
                                return (
                                    <li key={order.code}>
                                        <Link
                                            href={`/order/${order.code}`}
                                            className="flex items-center gap-4 rounded-2xl bg-slate-900/[.03] p-4 ring-1 ring-slate-900/[.05] transition hover:bg-slate-900/[.06]"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-black">
                                                    {order.items
                                                        .map(
                                                            (i) =>
                                                                i.product_name,
                                                        )
                                                        .join("، ")}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold text-ink-soft">
                                                    {toFa(order.code)} ·{" "}
                                                    {faDate(order.created_at)}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-end">
                                                <span
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${meta.tone}`}
                                                >
                                                    {meta.label}
                                                </span>
                                                <p className="mt-1.5 text-sm font-black">
                                                    {price(order.total)}{" "}
                                                    <span className="text-[10px] font-semibold text-ink-soft">
                                                        تومان
                                                    </span>
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/wishlist"
                        className="btn-ghost !justify-between !py-4"
                    >
                        علاقه‌مندی‌ها
                        <span className="text-ink-soft">
                            {fa(items.length)}
                        </span>
                    </Link>
                    <button
                        type="button"
                        onClick={exit}
                        className="btn-ghost !py-4 !text-coral-600"
                    >
                        خروج از حساب
                    </button>
                </div>
            </div>
        </div>
    );
}
