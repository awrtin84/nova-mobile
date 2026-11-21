import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DemoOrder from "@/components/DemoOrder";
import OrderView from "@/components/OrderView";
import { ApiError, DEMO, api } from "@/lib/api";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "پیگیری سفارش" };

type Props = { params: Promise<{ code: string }> };

async function load(code: string): Promise<Order> {
    try {
        return await api.order(code);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
    }
}

export default async function OrderPage({ params }: Props) {
    const { code } = await params;
    if (DEMO) return <DemoOrder code={code} />;
    const order = await load(code);
    return <OrderView order={order} />;
}
