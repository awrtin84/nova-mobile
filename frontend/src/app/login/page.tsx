import type { Metadata } from "next";
import { Suspense } from "react";
import "../auth.css";
import AuthExperience from "@/components/auth/AuthExperience";

export const metadata: Metadata = {
    title: "ورود و ثبت‌نام",
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="auth-scene" />}>
            <AuthExperience />
        </Suspense>
    );
}
