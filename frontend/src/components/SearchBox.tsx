"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProductVisual from "./ProductVisual";
import { price } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function SearchBox() {
    const router = useRouter();
    const params = useSearchParams();
    const [value, setValue] = useState(params.get("q") ?? "");
    const [results, setResults] = useState<Product[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(-1);
    const box = useRef<HTMLDivElement>(null);
    const serial = useRef(0);

    useEffect(() => {
        const term = value.trim();
        if (term.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        const id = ++serial.current;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const { api } = await import("@/lib/api");
                const page = await api.products({
                    q: term,
                    page_size: "5",
                } as never);
                if (id === serial.current) {
                    setResults(page.items.slice(0, 5));
                    setActive(-1);
                }
            } catch {
                if (id === serial.current) setResults([]);
            } finally {
                if (id === serial.current) setLoading(false);
            }
        }, 180);
        return () => clearTimeout(timer);
    }, [value]);

    useEffect(() => {
        function outside(event: PointerEvent) {
            if (box.current && !box.current.contains(event.target as Node))
                setOpen(false);
        }
        document.addEventListener("pointerdown", outside);
        return () => document.removeEventListener("pointerdown", outside);
    }, []);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        setOpen(false);
        if (active >= 0 && results[active]) {
            router.push(`/products/${results[active].slug}`);
            return;
        }
        const query = value.trim();
        router.push(
            query ? `/products?q=${encodeURIComponent(query)}` : "/products",
        );
    }

    function keyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") setOpen(false);
        if (event.key === "ArrowDown" && results.length) {
            event.preventDefault();
            setActive((current) => (current + 1) % results.length);
        }
        if (event.key === "ArrowUp" && results.length) {
            event.preventDefault();
            setActive((current) =>
                current <= 0 ? results.length - 1 : current - 1,
            );
        }
    }

    const term = value.trim();
    const show = open && term.length >= 2;

    return (
        <div ref={box} className="relative w-full">
            <form role="search" onSubmit={submit} className="relative w-full">
                <input
                    value={value}
                    onChange={(event) => {
                        setValue(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={keyDown}
                    placeholder="جستجوی گوشی، شارژر، هندزفری…"
                    enterKeyHint="search"
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={show}
                    aria-autocomplete="list"
                    className="w-full rounded-2xl border border-transparent bg-slate-900/[.05] py-3 pe-4 ps-12 text-[16px] outline-none transition placeholder:text-ink-mute focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 md:text-sm"
                />
                <button
                    type="submit"
                    aria-label="جستجو"
                    className="absolute start-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
                >
                    {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-coral-500" />
                    ) : (
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
                    )}
                </button>
            </form>

            {show && (
                <div className="suggest absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-3xl bg-white p-2 shadow-lift ring-1 ring-slate-900/[.06]">
                    {results.length === 0 ? (
                        <p className="px-4 py-5 text-center text-sm font-semibold text-ink-soft">
                            {loading ? "در حال جستجو…" : "نتیجه‌ای پیدا نشد"}
                        </p>
                    ) : (
                        <>
                            <ul>
                                {results.map((item, index) => (
                                    <li key={item.id}>
                                        <Link
                                            href={`/products/${item.slug}`}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-3 rounded-2xl p-2.5 transition ${
                                                index === active
                                                    ? "bg-slate-900/[.07]"
                                                    : "hover:bg-slate-900/[.05]"
                                            }`}
                                        >
                                            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                                                <ProductVisual
                                                    kind={item.visual_kind}
                                                    hue={item.hue}
                                                    className="h-full w-full"
                                                />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-extrabold">
                                                    {item.name}
                                                </span>
                                                <span className="block text-xs font-semibold text-ink-soft">
                                                    {item.brand.name}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-sm font-black">
                                                {price(item.final_price)}{" "}
                                                <span className="text-[10px] font-semibold text-ink-soft">
                                                    تومان
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={`/products?q=${encodeURIComponent(term)}`}
                                onClick={() => setOpen(false)}
                                className="mt-1 block rounded-2xl bg-slate-900/[.04] px-4 py-3 text-center text-sm font-extrabold text-brand-600 transition hover:bg-slate-900/[.08]"
                            >
                                مشاهده همه نتایج «{term}»
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
