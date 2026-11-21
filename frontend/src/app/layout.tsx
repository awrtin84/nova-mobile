import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import "./mobile.css";
import AppFeel from "@/components/AppFeel";
import BottomNav from "@/components/BottomNav";
import { CartProvider } from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Shell from "@/components/Shell";
import { UserProvider } from "@/components/UserProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
    title: {
        default: "نوا موبایل | فروشگاه موبایل و لوازم جانبی",
        template: "%s | نوا موبایل",
    },
    description:
        "خرید آنلاین گوشی موبایل، تبلت، ساعت هوشمند، هندزفری، شارژر و لوازم جانبی با بهترین قیمت",
    icons: { icon: "/icon.svg", apple: "/icon.svg" },
    appleWebApp: {
        capable: true,
        title: "نوا موبایل",
        statusBarStyle: "black-translucent",
    },
};

export const viewport: Viewport = {
    themeColor: "#14213d",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export const dynamic = "force-dynamic";

const themeScript = `try{var t=localStorage.getItem("nova-theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}`;

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let categories: Category[] = [];
    try {
        categories = await api.categories();
    } catch {}

    return (
        <html lang="fa" dir="rtl" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className="font-sans">
                <CartProvider>
                    <WishlistProvider>
                        <UserProvider>
                            <Shell
                                header={<Header categories={categories} />}
                                footer={<Footer categories={categories} />}
                            >
                                {children}
                            </Shell>
                            <Suspense fallback={null}>
                                <BottomNav />
                                <AppFeel />
                            </Suspense>
                        </UserProvider>
                    </WishlistProvider>
                </CartProvider>
            </body>
        </html>
    );
}
