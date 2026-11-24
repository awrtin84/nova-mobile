import AnimatedNumber from "./AnimatedNumber";
import { price } from "@/lib/format";
import type { Config } from "@/lib/types";

type Props = {
    subtotal: number;
    config: Config;
    children?: React.ReactNode;
};

export function shippingFor(subtotal: number, config: Config) {
    return subtotal >= config.free_shipping_threshold ? 0 : config.shipping_fee;
}

export default function OrderSummary({ subtotal, config, children }: Props) {
    const shipping = shippingFor(subtotal, config);
    const remaining = Math.max(0, config.free_shipping_threshold - subtotal);
    const progress = Math.min(
        100,
        Math.round((subtotal / config.free_shipping_threshold) * 100),
    );

    return (
        <div className="card sticky top-36 space-y-4 p-6">
            <h2 className="text-lg font-black">خلاصه سفارش</h2>

            <div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-l from-brand-500 to-coral-500 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="mt-2 text-xs font-semibold text-ink-soft">
                    {remaining === 0
                        ? "ارسال این سفارش رایگان است"
                        : `${price(remaining)} تومان دیگر تا ارسال رایگان`}
                </p>
            </div>

            <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <dt className="text-ink-soft">جمع کالاها</dt>
                    <dd className="font-bold">
                        <AnimatedNumber value={subtotal} /> تومان
                    </dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-ink-soft">هزینه ارسال</dt>
                    <dd className="font-bold">
                        {shipping === 0 ? (
                            "رایگان"
                        ) : (
                            <>
                                <AnimatedNumber value={shipping} /> تومان
                            </>
                        )}
                    </dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                    <dt className="font-extrabold">مبلغ قابل پرداخت</dt>
                    <dd className="font-black text-brand-700">
                        <AnimatedNumber value={subtotal + shipping} /> تومان
                    </dd>
                </div>
            </dl>

            {children}
        </div>
    );
}
