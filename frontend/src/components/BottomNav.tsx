"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { useUser } from "./UserProvider";
import { fa } from "@/lib/format";

const icons: Record<string, React.ReactNode> = {
    home: (
        <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
    grid: (
        <>
            <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
        </>
    ),
    tag: (
        <>
            <path d="M3 12V4h8l10 10-8 8z" />
            <circle cx="7.5" cy="8.5" r="1.2" />
        </>
    ),
    truck: (
        <>
            <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" />
            <circle cx="7" cy="17.5" r="1.8" />
            <circle cx="17" cy="17.5" r="1.8" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8.5" r="3.8" />
            <path d="M4.5 20.5c1.2-3.6 4-5.2 7.5-5.2s6.3 1.6 7.5 5.2" />
        </>
    ),
    cart: (
        <>
            <path d="M6 7h13l-1.5 9h-10z" />
            <path d="M6 7 5 3H2" />
            <circle cx="9" cy="20" r="1.3" />
            <circle cx="17" cy="20" r="1.3" />
        </>
    ),
};

function Icon({ name, size = 22 }: { name: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[name]}
        </svg>
    );
}

function Item({
    href,
    label,
    icon,
    active,
}: {
    href: string;
    label: string;
    icon: string;
    active: boolean;
}) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex w-[3.8rem] flex-col items-center gap-0.5 pb-1 pt-1.5 text-[10.5px] font-bold transition ${
                active ? "text-white" : "text-white/50"
            }`}
        >
            <span
                className={`flex h-8 w-11 items-center justify-center rounded-full transition ${active ? "bg-white/15" : ""}`}
            >
                <Icon name={icon} />
            </span>
            {label}
        </Link>
    );
}

export default function BottomNav() {
    const pathname = usePathname();
    const params = useSearchParams();
    const { count, ready } = useCart();
    const { user: stored } = useUser();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const user = mounted ? stored : null;

    const hidden =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/checkout") ||
        /^\/products\/[^/]+/.test(pathname);
    if (hidden) return null;

    const onSale = params.get("on_sale") === "true";
    const inCart = pathname.startsWith("/cart");

    return (
        <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
            style={{
                paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)",
            }}
        >
            <nav
                aria-label="ناوبری اصلی"
                className="pointer-events-auto mx-auto flex max-w-md items-end justify-between rounded-[1.9rem] bg-night/95 px-2 pb-1 pt-1 shadow-dock ring-1 ring-white/10 backdrop-blur-2xl"
            >
                <Item
                    href="/"
                    label="خانه"
                    icon="home"
                    active={pathname === "/"}
                />
                <Item
                    href="/products"
                    label="محصولات"
                    icon="grid"
                    active={pathname === "/products" && !onSale}
                />

                <Link
                    href="/cart"
                    aria-label="سبد خرید"
                    data-cart-target
                    aria-current={inCart ? "page" : undefined}
                    className="relative -mt-9 flex h-[3.6rem] w-[3.6rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral-400 via-coral-500 to-brand-600 text-white shadow-glow ring-4 ring-night transition active:scale-95"
                >
                    <Icon name="cart" size={26} />
                    {ready && count > 0 && (
                        <span
                            key={count}
                            className="absolute -end-1 -top-1 flex h-6 min-w-6 animate-pop items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-black text-coral-600 ring-2 ring-night"
                        >
                            {fa(count)}
                        </span>
                    )}
                </Link>

                <Item
                    href="/products?on_sale=true&sort=discount"
                    label="تخفیف‌ها"
                    icon="tag"
                    active={pathname === "/products" && onSale}
                />
                <Item
                    href={user ? "/account" : "/login?next=/account"}
                    label={user ? "حساب" : "ورود"}
                    icon="user"
                    active={
                        pathname.startsWith("/account") ||
                        pathname.startsWith("/track") ||
                        pathname.startsWith("/order")
                    }
                />
            </nav>
        </div>
    );
}
