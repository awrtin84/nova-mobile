"use client";

export default function ErrorPage({
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
            <h1 className="text-2xl font-black">
                مشکلی در دریافت اطلاعات پیش آمد
            </h1>
            <p className="text-sm text-ink-soft">
                مطمئن شوید سرور FastAPI روی پورت ۸۰۰۰ در حال اجراست.
            </p>
            <button type="button" onClick={reset} className="btn-primary mt-2">
                تلاش دوباره
            </button>
        </div>
    );
}
