"use client";

import { useRef, useState } from "react";
import { haptic } from "@/lib/haptic";

type Props = {
    children: React.ReactNode;
    onDelete: () => void;
    className?: string;
};

const THRESHOLD = 96;

export default function SwipeRow({
    children,
    onDelete,
    className = "",
}: Props) {
    const [dx, setDx] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const [dragging, setDragging] = useState(false);
    const start = useRef<{
        x: number;
        y: number;
        locked: boolean | null;
        id: number;
    } | null>(null);
    const armed = useRef(false);
    const current = useRef(0);

    function down(event: React.PointerEvent<HTMLDivElement>) {
        if (event.pointerType === "mouse") return;
        start.current = {
            x: event.clientX,
            y: event.clientY,
            locked: null,
            id: event.pointerId,
        };
    }

    function move(event: React.PointerEvent<HTMLDivElement>) {
        const origin = start.current;
        if (!origin || origin.id !== event.pointerId) return;
        const deltaX = event.clientX - origin.x;
        const deltaY = event.clientY - origin.y;

        if (origin.locked === null) {
            if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
            origin.locked = Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
            if (origin.locked) {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
            }
        }
        if (!origin.locked) return;

        const damped =
            Math.sign(deltaX) * Math.min(Math.abs(deltaX), 220) ** 0.97;
        current.current = damped;
        setDx(damped);
        const pass = Math.abs(damped) >= THRESHOLD;
        if (pass && !armed.current) haptic(14);
        armed.current = pass;
    }

    function end(event: React.PointerEvent<HTMLDivElement>) {
        const origin = start.current;
        start.current = null;
        if (!origin || origin.id !== event.pointerId) return;
        setDragging(false);
        const final = current.current;
        current.current = 0;
        if (origin.locked && Math.abs(final) >= THRESHOLD) {
            haptic([18, 40, 24]);
            setLeaving(true);
            setDx(final > 0 ? 520 : -520);
            setTimeout(onDelete, 260);
        } else {
            setDx(0);
        }
        armed.current = false;
    }

    const progress = Math.min(1, Math.abs(dx) / THRESHOLD);

    return (
        <div
            className={`relative overflow-hidden rounded-[1.75rem] transition-[max-height,opacity,margin] duration-300 ${
                leaving ? "!m-0 max-h-0 opacity-0" : "max-h-96"
            } ${className}`}
            style={{ transitionDelay: leaving ? "0.18s" : "0s" }}
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-between rounded-[1.75rem] bg-coral-500 px-7 text-white"
                style={{ opacity: 0.25 + progress * 0.75 }}
            >
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ transform: `scale(${0.7 + progress * 0.4})` }}
                >
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </svg>
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ transform: `scale(${0.7 + progress * 0.4})` }}
                >
                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </svg>
            </div>
            <div
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
                className="relative"
                style={{
                    transform: `translateX(${dx}px)`,
                    transition: dragging
                        ? "none"
                        : "transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)",
                    touchAction: "pan-y",
                }}
            >
                {children}
            </div>
        </div>
    );
}
