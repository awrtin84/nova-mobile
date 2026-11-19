"use client";

import { usePathname } from "next/navigation";

type Props = {
    header: React.ReactNode;
    footer: React.ReactNode;
    children: React.ReactNode;
};

export default function Shell({ header, footer, children }: Props) {
    const isAdmin = usePathname().startsWith("/admin");

    return (
        <>
            {!isAdmin && header}
            <main className="min-h-[70vh]">{children}</main>
            {!isAdmin && footer}
        </>
    );
}
