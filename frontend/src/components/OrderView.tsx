import Link from "next/link";
import { fa, faDate, price } from "@/lib/format";
import { STATUSES, statusMeta } from "@/lib/status";
import type { Order } from "@/lib/types";

const FLOW = STATUSES.filter((item) => item.value !== "cancelled");

export default function OrderView({ order }: { order: Order }) {
    const cancelled = order.status === "cancelled";
    const currentIndex = FLOW.findIndex((item) => item.value === order.status);
    const meta = statusMeta(order.status);

    return (
        <div className="container-page max-w-3xl py-10">
            <div className="card overflow-hidden">
                <div
                    className={`px-6 py-10 text-center text-white ${
                        cancelled
                            ? "bg-gradient-to-br from-rose-700 to-rose-500"
                            : "bg-gradient-to-br from-brand-700 to-brand-500"
                    }`}
                >
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                        {cancelled ? (
                            <svg
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                            >
                                <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                        ) : (
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m5 12.5 4.5 4.5L19 7.5" />
                            </svg>
                        )}
                    </span>
                    <h1 className="mt-4 text-2xl font-black">
                        {cancelled
                            ? "این سفارش لغو شده است"
                            : "سفارش شما ثبت شده است"}
                    </h1>
                    <p className="mt-2 text-sm text-white/80">
                        کد پیگیری سفارش
                    </p>
                    <p
                        className="mt-1 text-2xl font-black tracking-wider"
                        dir="ltr"
                    >
                        {order.code}
                    </p>
                    <p className="mt-3 text-xs text-white/70">
                        {faDate(order.created_at)}
                    </p>
                </div>

                <div className="space-y-6 p-6">
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-base font-black">
                                وضعیت سفارش
                            </h2>
                            <span
                                className={`rounded-lg px-3 py-1 text-xs font-extrabold ${meta.tone}`}
                            >
                                {meta.label}
                            </span>
                        </div>
                        {!cancelled && (
                            <ol className="grid grid-cols-4 gap-2">
                                {FLOW.map((step, index) => {
                                    const done = index <= currentIndex;
                                    return (
                                        <li
                                            key={step.value}
                                            className="text-center"
                                        >
                                            <div
                                                className={`h-2 rounded-full ${done ? "bg-brand-600" : "bg-slate-200"}`}
                                            />
                                            <p
                                                className={`mt-2 text-[11px] font-bold leading-5 sm:text-xs ${done ? "text-brand-700" : "text-ink-mute"}`}
                                            >
                                                {step.label}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </section>

                    <section>
                        <h2 className="mb-3 text-base font-black">
                            مشخصات تحویل
                        </h2>
                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-ink-soft">تحویل گیرنده</dt>
                                <dd className="font-bold">
                                    {order.customer_name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-ink-soft">شماره تماس</dt>
                                <dd className="font-bold">
                                    {fa(Number(order.phone)).replace(/٬/g, "")}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-ink-soft">آدرس</dt>
                                <dd className="font-bold leading-7">
                                    {order.city}، {order.address}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section>
                        <h2 className="mb-3 text-base font-black">کالاها</h2>
                        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
                            {order.items.map((item, index) => (
                                <li
                                    key={`${item.product_id}-${item.color}-${index}`}
                                    className="flex items-center justify-between gap-4 p-4 text-sm"
                                >
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 font-bold leading-6">
                                            {item.product_name}
                                        </p>
                                        <p className="mt-1 text-xs text-ink-soft">
                                            {item.color && `${item.color} · `}
                                            {fa(item.quantity)} عدد
                                        </p>
                                    </div>
                                    <p className="shrink-0 font-black">
                                        {price(item.unit_price * item.quantity)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <dl className="space-y-2 rounded-2xl bg-slate-50 p-5 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">جمع کالاها</dt>
                            <dd className="font-bold">
                                {price(order.subtotal)} تومان
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">هزینه ارسال</dt>
                            <dd className="font-bold">
                                {order.shipping_fee === 0
                                    ? "رایگان"
                                    : `${price(order.shipping_fee)} تومان`}
                            </dd>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                            <dt className="font-extrabold">
                                مبلغ کل (پرداخت در محل)
                            </dt>
                            <dd className="font-black text-brand-700">
                                {price(order.total)} تومان
                            </dd>
                        </div>
                    </dl>

                    <Link href="/products" className="btn-primary w-full">
                        ادامه خرید
                    </Link>
                </div>
            </div>
        </div>
    );
}
