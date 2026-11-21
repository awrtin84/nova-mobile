"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/haptic";

type Phase = "idle" | "run" | "done";

export default function AppFeel() {
    const pathname = usePathname();
    const params = useSearchParams();
    const [phase, setPhase] = useState<Phase>("idle");
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        setPhase((current) => (current === "run" ? "done" : "idle"));
        timer.current = setTimeout(() => setPhase("idle"), 450);
        return () => clearTimeout(timer.current);
    }, [pathname, params]);

    useEffect(() => {
        let safety: ReturnType<typeof setTimeout> | undefined;

        function onClick(event: MouseEvent) {
            const target = event.target as Element | null;
            const control = target?.closest(
                "a, button, [role='button'], summary",
            );
            if (control) haptic(8);

            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            )
                return;
            const link = target?.closest("a");
            if (
                !link ||
                link.target === "_blank" ||
                link.hasAttribute("download")
            )
                return;
            const href = link.getAttribute("href");
            if (!href || href.startsWith("#")) return;
            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin) return;
            if (
                url.pathname === window.location.pathname &&
                url.search === window.location.search
            )
                return;

            setPhase("run");
            clearTimeout(safety);
            safety = setTimeout(() => setPhase("idle"), 9000);
        }

        document.addEventListener("click", onClick);
        return () => {
            document.removeEventListener("click", onClick);
            clearTimeout(safety);
        };
    }, []);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        const viewport = window.innerHeight;
        const targets = Array.from(
            document.querySelectorAll<HTMLElement>("main section"),
        ).filter(
            (element) => element.getBoundingClientRect().top > viewport * 0.9,
        );
        if (targets.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).classList.add(
                            "reveal-in",
                        );
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.06, rootMargin: "0px 0px -6% 0px" },
        );

        for (const element of targets) {
            element.classList.add("reveal");
            observer.observe(element);
        }

        return () => {
            observer.disconnect();
            for (const element of targets)
                element.classList.remove("reveal", "reveal-in");
        };
    }, [pathname, params]);

    return (
        <div aria-hidden="true" className="route-progress" data-phase={phase}>
            <span />
        </div>
    );
}
