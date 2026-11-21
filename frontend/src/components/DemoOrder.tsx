"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OrderView from "./OrderView";
import { readDemoOrder } from "@/lib/demo-api";
import type { Order } from "@/lib/types";

export default function DemoOrder({ code }: { code: string }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setOrder(readDemoOrder(code));
        setLoaded(true);
    }, [code]);

    if (!loaded)
        return (
            <div className="container-page max-w-3xl py-10">
                <div className="skeleton h-96 rounded-[1.75rem]" />
            </div>
        );

    if (!order) {
        return (
            <div className="container-page max-w-lg py-16">
                <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
                    <h1 className="text-xl font-black">
                        سفارشی با این کد پیدا نشد
                    </h1>
                    <p className="text-sm leading-7 text-ink-soft">
                        در نسخه‌ی دمو، سفارش‌ها فقط روی همین مرورگر ذخیره
                        می‌شوند و از دستگاه دیگر قابل مشاهده نیستند.
                    </p>
                    <Link href="/products" className="btn-primary">
                        دیدن محصولات
                    </Link>
                </div>
            </div>
        );
    }

    return <OrderView order={order} />;
}
