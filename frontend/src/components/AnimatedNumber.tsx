"use client";

import { useEffect, useRef, useState } from "react";
import { price } from "@/lib/format";

export default function AnimatedNumber({
    value,
    duration = 520,
}: {
    value: number;
    duration?: number;
}) {
    const [shown, setShown] = useState(value);
    const from = useRef(value);

    useEffect(() => {
        if (from.current === value) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            from.current = value;
            setShown(value);
            return;
        }
        const start = performance.now();
        const origin = from.current;
        let frame = 0;

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setShown(Math.round(origin + (value - origin) * eased));
            if (t < 1) frame = requestAnimationFrame(tick);
            else from.current = value;
        };

        frame = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(frame);
            from.current = value;
        };
    }, [value, duration]);

    return <span className="tabular-nums">{price(shown)}</span>;
}
