"use client";

import Link from "next/link";
import { useRef } from "react";
import ProductVisual from "./ProductVisual";

type Props = {
    href: string;
    kind: string;
    hue: number;
    name: string;
    price: string;
    rating: string;
};

const SLABS = Array.from({ length: 14 }, (_, index) => index);

export default function Phone3D({
    href,
    kind,
    hue,
    name,
    price,
    rating,
}: Props) {
    const stage = useRef<HTMLAnchorElement>(null);
    const orbit = useRef<HTMLDivElement>(null);

    function move(event: React.PointerEvent<HTMLAnchorElement>) {
        if (!stage.current || !orbit.current) return;
        const box = stage.current.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        orbit.current.style.setProperty("--ry", `${(x * 46).toFixed(2)}deg`);
        orbit.current.style.setProperty("--rx", `${(-y * 30).toFixed(2)}deg`);
        stage.current.dataset.active = "1";
    }

    function reset() {
        if (!stage.current || !orbit.current) return;
        orbit.current.style.removeProperty("--rx");
        orbit.current.style.removeProperty("--ry");
        delete stage.current.dataset.active;
    }

    return (
        <Link
            ref={stage}
            href={href}
            aria-label={name}
            onPointerMove={move}
            onPointerLeave={reset}
            onPointerCancel={reset}
            className="phone-stage relative mx-auto flex h-[27rem] w-full max-w-[22rem] items-center justify-center md:h-[33rem]"
            style={{ perspective: "1100px" }}
        >
            <div ref={orbit} className="phone-orbit relative">
                <div className="absolute left-1/2 top-1/2 -ml-[9.5rem] -mt-[9.5rem] h-[19rem] w-[19rem] md:-ml-[11rem] md:-mt-[11rem] md:h-[22rem] md:w-[22rem]">
                    <span className="ring3d inset-0" />
                </div>
                <div className="absolute left-1/2 top-1/2 -ml-[7rem] -mt-[7rem] h-[14rem] w-[14rem] md:-ml-[8rem] md:-mt-[8rem] md:h-[16rem] md:w-[16rem]">
                    <span
                        className="ring3d inset-0 opacity-60"
                        style={{
                            animationDirection: "reverse",
                            animationDuration: "18s",
                        }}
                    />
                </div>

                <span
                    className="orb"
                    style={{
                        ["--c" as string]: "#ff6b5b",
                        width: 34,
                        height: 34,
                        left: "-3.2rem",
                        top: "2rem",
                        transform: "translateZ(90px)",
                    }}
                />
                <span
                    className="orb"
                    style={{
                        ["--c" as string]: "#f4ede0",
                        width: 22,
                        height: 22,
                        right: "-2.6rem",
                        bottom: "5rem",
                        transform: "translateZ(110px)",
                        animationDelay: "-2s",
                    }}
                />
                <span
                    className="orb"
                    style={{
                        ["--c" as string]: "#5b7bc0",
                        width: 16,
                        height: 16,
                        right: "-1.6rem",
                        top: "4rem",
                        transform: "translateZ(40px)",
                        animationDelay: "-3.4s",
                    }}
                />

                <div className="phone-sway">
                    <div className="phone">
                        {SLABS.map((index) => (
                            <span
                                key={index}
                                className="phone-slab"
                                style={{
                                    transform: `translateZ(${-index * 1.7}px)`,
                                }}
                            />
                        ))}

                        <div className="phone-front">
                            <div className="phone-screen">
                                <ProductVisual kind={kind} hue={hue} />
                                <span className="absolute left-1/2 top-2.5 h-5 w-16 -translate-x-1/2 rounded-full bg-black" />
                                <span className="phone-gloss" />
                            </div>
                        </div>

                        <span
                            className="absolute -start-9 bottom-14 rounded-2xl bg-white px-3.5 py-2 text-xs font-black text-ink shadow-2xl"
                            style={{ transform: "translateZ(80px)" }}
                        >
                            {price}{" "}
                            <span className="text-[10px] font-semibold text-ink-soft">
                                تومان
                            </span>
                        </span>
                        <span
                            className="absolute -end-7 top-16 flex items-center gap-1 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 px-3 py-1.5 text-xs font-black text-white shadow-2xl"
                            style={{ transform: "translateZ(60px)" }}
                        >
                            ★ {rating}
                        </span>
                    </div>
                </div>

                <span
                    aria-hidden="true"
                    className="absolute -bottom-12 left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-black/60 blur-xl"
                    style={{
                        transform:
                            "translateX(-50%) translateZ(-60px) rotateX(75deg)",
                    }}
                />
            </div>
        </Link>
    );
}
