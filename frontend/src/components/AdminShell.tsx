"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { LOGOUT_EVENT, admin, getToken, setToken } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";

const links = [
    { href: "/admin", label: "داشبورد" },
    { href: "/admin/products", label: "محصولات" },
    { href: "/admin/orders", label: "سفارش‌ها" },
];

function LoginForm({ onDone }: { onDone: () => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { token } = await admin.login(password);
            setToken(token);
            onDone();
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "ارتباط با سرور برقرار نشد",
            );
            setLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4">
            <div className="absolute end-4 top-4">
                <ThemeToggle />
            </div>
            <form
                onSubmit={submit}
                className="card w-full max-w-sm space-y-5 p-8"
            >
                <div className="text-center">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-coral-500 text-xl font-black text-white shadow-lift">
                        N
                    </span>
                    <h1 className="mt-4 text-xl font-black">
                        ورود به پنل مدیریت
                    </h1>
                    <p className="mt-1 text-sm text-ink-soft">نوا موبایل</p>
                </div>
                <label className="block">
                    <span className="mb-2 block text-sm font-bold">
                        رمز عبور
                    </span>
                    <input
                        type="password"
                        autoFocus
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="field"
                        dir="ltr"
                    />
                </label>
                {error && (
                    <p
                        role="alert"
                        className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600"
                    >
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={loading || !password}
                    className="btn-primary w-full"
                >
                    {loading ? "در حال ورود…" : "ورود"}
                </button>
                <Link
                    href="/"
                    className="block text-center text-sm font-bold text-ink-soft hover:text-brand-700"
                >
                    بازگشت به فروشگاه
                </Link>
            </form>
        </div>
    );
}

export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [authed, setAuthed] = useState<boolean | null>(null);

    useEffect(() => {
        setAuthed(Boolean(getToken()));
        const onLogout = () => setAuthed(false);
        window.addEventListener(LOGOUT_EVENT, onLogout);
        return () => window.removeEventListener(LOGOUT_EVENT, onLogout);
    }, []);

    if (authed === null) return <div className="min-h-screen" />;
    if (!authed) return <LoginForm onDone={() => setAuthed(true)} />;

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
                <div className="container-page flex flex-wrap items-center gap-3 py-3">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-coral-500 font-black text-white">
                            N
                        </span>
                        <span className="font-black">پنل مدیریت</span>
                    </Link>

                    <nav className="no-scrollbar order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1 sm:ps-4">
                        {links.map((link) => {
                            const active =
                                link.href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
                                        active
                                            ? "bg-brand-600 text-white"
                                            : "text-ink-soft hover:bg-slate-100"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="ms-auto flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/" className="btn-ghost !px-4 !py-2">
                            مشاهده سایت
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                setToken(null);
                                setAuthed(false);
                            }}
                            className="rounded-2xl px-4 py-2 text-sm font-bold text-coral-600 transition hover:bg-coral-50"
                        >
                            خروج
                        </button>
                    </div>
                </div>
            </header>
            <div className="container-page py-8">{children}</div>
        </div>
    );
}
