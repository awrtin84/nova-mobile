"use client";

import { useRef } from "react";

type Props = {
    children: React.ReactNode;
    className?: string;
    max?: number;
};

export default function Tilt({ children, className = "", max = 9 }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const frame = useRef(0);

    function move(event: React.PointerEvent<HTMLDivElement>) {
        const element = ref.current;
        if (!element || event.pointerType === "touch") return;
        const { clientX, clientY } = event;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const box = element.getBoundingClientRect();
            const x = (clientX - box.left) / box.width;
            const y = (clientY - box.top) / box.height;
            element.style.setProperty(
                "--ry",
                `${((x - 0.5) * max * 2).toFixed(2)}deg`,
            );
            element.style.setProperty(
                "--rx",
                `${(-(y - 0.5) * max * 2).toFixed(2)}deg`,
            );
            element.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
            element.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
            element.dataset.active = "1";
        });
    }

    function reset() {
        const element = ref.current;
        cancelAnimationFrame(frame.current);
        if (!element) return;
        element.style.removeProperty("--rx");
        element.style.removeProperty("--ry");
        delete element.dataset.active;
    }

    return (
        <div
            ref={ref}
            onPointerMove={move}
            onPointerLeave={reset}
            onPointerCancel={reset}
            onPointerUp={(event) => event.pointerType === "touch" && reset()}
            className={`tilt ${className}`}
        >
            {children}
            <span aria-hidden="true" className="tilt-glare" />
        </div>
    );
}
