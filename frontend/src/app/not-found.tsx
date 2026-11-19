import Link from "next/link";

export default function NotFound() {
    return (
        <div className="container-page py-16 md:py-24">
            <div className="card mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-14 text-center">
                <p className="bg-gradient-to-br from-brand-500 to-coral-500 bg-clip-text text-8xl font-black leading-none text-transparent">
                    ۴۰۴
                </p>
                <h1 className="text-xl font-black">
                    صفحه‌ای که دنبالش بودید پیدا نشد
                </h1>
                <p className="text-sm leading-7 text-ink-soft">
                    ممکن است آدرس اشتباه باشد یا این کالا دیگر موجود نباشد.
                </p>
                <div className="mt-2 flex w-full gap-3">
                    <Link href="/" className="btn-primary flex-1">
                        صفحه اصلی
                    </Link>
                    <Link href="/products" className="btn-ghost flex-1">
                        محصولات
                    </Link>
                </div>
            </div>
        </div>
    );
}
