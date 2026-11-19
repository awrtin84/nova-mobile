"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackForm() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    function submit(event: React.FormEvent) {
        event.preventDefault();
        const value = code.trim().toUpperCase();
        if (!/^NV\d{8}$/.test(value)) {
            setError("کد پیگیری باید به شکل NV و ۸ رقم باشد، مثلاً NV12345678");
            return;
        }
        router.push(`/order/${value}`);
    }

    return (
        <form onSubmit={submit} className="card mx-auto max-w-lg space-y-5 p-8">
            <label className="block">
                <span className="mb-2 block text-sm font-bold">
                    کد پیگیری سفارش
                </span>
                <input
                    value={code}
                    onChange={(event) => {
                        setCode(event.target.value);
                        setError(null);
                    }}
                    placeholder="NV12345678"
                    dir="ltr"
                    className="field text-center tracking-widest"
                />
                {error && (
                    <span className="mt-2 block text-xs font-bold leading-6 text-coral-600">
                        {error}
                    </span>
                )}
            </label>
            <button type="submit" className="btn-primary w-full">
                پیگیری سفارش
            </button>
        </form>
    );
}
