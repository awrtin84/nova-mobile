"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { useUser } from "./UserProvider";
import ThemeToggle from "./ThemeToggle";
import { useWishlist } from "./WishlistProvider";
import { fa } from "@/lib/format";
import type { Category } from "@/lib/types";

function SearchBox() {
    const router = useRouter();
    const params = useSearchParams();
    const [value, setValue] = useState(params.get("q") ?? "");

    return (
        <form
            role="search"
            onSubmit={(event) => {
                event.preventDefault();
                const query = value.trim();
                router.push(
                    query
                        ? `/products?q=${encodeURIComponent(query)}`
                        : "/products",
                );
            }}
            className="relative w-full"
        >
            <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="جستجوی گوشی، شارژر، هندزفری…"
                enterKeyHint="search"
                className="w-full rounded-2xl border border-transparent bg-slate-900/[.05] py-3 pe-4 ps-12 text-[16px] outline-none transition placeholder:text-ink-mute focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 md:text-sm"
            />
            <button
                type="submit"
                aria-label="جستجو"
                className="absolute start-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
            </button>
        </form>
    );
}

function AccountLink() {
    const { user: stored, ready } = useUser();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const user = mounted ? stored : null;
    const href = user ? "/account" : "/login";
    return (
        <Link
            href={href}
            aria-label={user ? "حساب کاربری" : "ورود یا ثبت‌نام"}
            className="hidden h-12 shrink-0 items-center gap-2 rounded-2xl bg-slate-900/[.05] px-4 text-sm font-extrabold text-ink transition hover:bg-slate-900/[.09] md:flex"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="8.5" r="3.8" />
                <path d="M4.5 20.5c1.2-3.6 4-5.2 7.5-5.2s6.3 1.6 7.5 5.2" />
            </svg>
            <span className="max-w-[7rem] truncate">
                {ready && user ? user.name || "حساب من" : "ورود | ثبت‌نام"}
            </span>
        </Link>
    );
}

function CartLink() {
    const { count, ready } = useCart();
    return (
        <Link
            href="/cart"
            aria-label="سبد خرید"
            className="relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift transition hover:brightness-110 md:flex"
        >
            <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M6 7h13l-1.5 9h-10z" />
                <path d="M6 7 5 3H2" />
                <circle cx="9" cy="20" r="1.3" />
                <circle cx="17" cy="20" r="1.3" />
            </svg>
            {ready && count > 0 && (
                <span className="absolute -end-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-coral-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">
                    {fa(count)}
                </span>
            )}
        </Link>
    );
}

function Chips({ categories }: { categories: Category[] }) {
    const pathname = usePathname();
    const params = useSearchParams();
    const { items, ready } = useWishlist();
    const listing = pathname === "/products";
    const category = listing ? (params.get("category") ?? "") : null;
    const onSale = listing && params.get("on_sale") === "true";
    const onWishlist = pathname === "/wishlist";

    const base =
        "shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition";
    const idle =
        "bg-white text-ink-soft ring-1 ring-slate-900/[.06] hover:text-ink";
    const on = "bg-ink text-white shadow-lg shadow-slate-900/20";

    return (
        <div className="container-page no-scrollbar flex items-center gap-2 overflow-x-auto pb-3 pt-0.5">
            <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                className={`${base} hidden items-center gap-1.5 md:inline-flex ${pathname === "/" ? on : idle}`}
            >
                <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                </svg>
                خانه
            </Link>
            <Link
                href="/products"
                className={`${base} ${listing && !category && !onSale ? on : idle}`}
            >
                همه
            </Link>
            {categories.map((item) => (
                <Link
                    key={item.slug}
                    href={`/products?category=${item.slug}`}
                    className={`${base} ${category === item.slug ? on : idle}`}
                >
                    {item.name}
                </Link>
            ))}
            <Link
                href="/products?on_sale=true&sort=discount"
                className={`${base} ${
                    onSale
                        ? "bg-gradient-to-br from-coral-400 to-coral-600 text-white shadow-lg shadow-coral-500/30"
                        : "bg-coral-50 text-coral-600 ring-1 ring-coral-100"
                }`}
            >
                تخفیف‌ها
            </Link>
            <Link
                href="/wishlist"
                className={`${base} ${onWishlist ? on : idle}`}
            >
                علاقه‌مندی‌ها
                {ready && items.length > 0 ? ` (${fa(items.length)})` : ""}
            </Link>
        </div>
    );
}

export default function Header({ categories }: { categories: Category[] }) {
    const [hidden, setHidden] = useState(false);
    const last = useRef(0);

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            if (Math.abs(y - last.current) < 8) return;
            setHidden(window.innerWidth < 768 && y > last.current && y > 140);
            last.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-40 border-b border-slate-900/[.05] bg-white/75 backdrop-blur-2xl transition-transform duration-300 ${
                hidden ? "-translate-y-full" : "translate-y-0"
            }`}
        >
            <div className="container-page flex items-center gap-2.5 py-3 md:gap-3">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2.5"
                    aria-label="نوا موبایل"
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-coral-500 text-lg font-black text-white shadow-lift">
                        N
                    </span>
                    <span className="hidden leading-tight sm:block">
                        <span className="block text-lg font-black tracking-tight">
                            نوا موبایل
                        </span>
                        <span className="block text-[11px] font-semibold text-ink-mute">
                            Nova Mobile
                        </span>
                    </span>
                </Link>

                <div className="min-w-0 flex-1">
                    <Suspense
                        fallback={
                            <div className="h-11 rounded-2xl bg-slate-900/[.05]" />
                        }
                    >
                        <SearchBox />
                    </Suspense>
                </div>

                <ThemeToggle />
                <AccountLink />
                <CartLink />
            </div>

            <nav aria-label="دسته‌بندی‌ها">
                <Suspense fallback={<div className="h-12" />}>
                    <Chips categories={categories} />
                </Suspense>
            </nav>
        </header>
    );
}
