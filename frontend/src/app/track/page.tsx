import type { Metadata } from "next";
import TrackForm from "@/components/TrackForm";

export const metadata: Metadata = { title: "پیگیری سفارش" };

export default function TrackPage() {
    return (
        <div className="container-page py-14">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-black sm:text-3xl">
                    پیگیری سفارش
                </h1>
                <p className="mt-2 text-sm text-ink-soft">
                    کد پیگیری که بعد از ثبت سفارش دریافت کرده‌اید را وارد کنید.
                </p>
            </div>
            <TrackForm />
        </div>
    );
}
