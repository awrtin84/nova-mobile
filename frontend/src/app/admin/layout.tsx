import type { Metadata } from "next";
import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { DEMO } from "@/lib/api";

export const metadata: Metadata = {
    title: "پنل مدیریت",
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    if (DEMO) {
        return (
            <div className="container-page flex min-h-screen items-center justify-center py-16">
                <div className="card flex max-w-md flex-col items-center gap-4 px-6 py-14 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-coral-500 text-xl font-black text-white shadow-lift">
                        N
                    </span>
                    <h1 className="text-xl font-black">
                        پنل مدیریت در نسخه‌ی دمو غیرفعال است
                    </h1>
                    <p className="text-sm leading-7 text-ink-soft">
                        این نسخه‌ی آنلاین فقط ویترین فروشگاه است و بک‌اند ندارد.
                        پنل مدیریت در نسخه‌ی کامل پروژه (Next.js + FastAPI) فعال
                        است.
                    </p>
                    <Link href="/" className="btn-primary">
                        بازگشت به فروشگاه
                    </Link>
                </div>
            </div>
        );
    }

    return <AdminShell>{children}</AdminShell>;
}
