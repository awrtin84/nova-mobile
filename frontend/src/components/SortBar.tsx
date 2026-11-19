"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const sorts = [
    { value: "newest", label: "جدیدترین" },
    { value: "bestselling", label: "پرفروش‌ترین" },
    { value: "cheapest", label: "ارزان‌ترین" },
    { value: "expensive", label: "گران‌ترین" },
    { value: "rating", label: "بیشترین امتیاز" },
    { value: "discount", label: "بیشترین تخفیف" },
];

export default function SortBar() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const [pending, startTransition] = useTransition();
    const sort = params.get("sort") ?? "newest";

    function change(value: string) {
        const next = new URLSearchParams(params.toString());
        next.set("sort", value);
        next.delete("page");
        startTransition(() => router.push(`${pathname}?${next.toString()}`));
    }

    return (
        <div
            className={`mb-4 flex items-center gap-3 transition ${pending ? "opacity-60" : ""}`}
        >
            <span className="hidden shrink-0 text-sm font-bold text-ink-soft lg:block">
                مرتب‌سازی:
            </span>
            <div className="no-scrollbar -mx-4 flex flex-1 gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
                {sorts.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => change(item.value)}
                        className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${
                            sort === item.value
                                ? "bg-ink text-white shadow-lg shadow-slate-900/20"
                                : "bg-white text-ink-soft ring-1 ring-slate-900/[.06] hover:text-ink"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
