export function flyToCart(source: HTMLElement) {
    if (typeof document === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = Array.from(
        document.querySelectorAll<HTMLElement>("[data-cart-target]"),
    ).find((element) => element.getClientRects().length > 0);
    if (!target) return;

    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const dx = to.left + to.width / 2 - startX;
    const dy = to.top + to.height / 2 - startY;

    const dot = document.createElement("div");
    Object.assign(dot.style, {
        position: "fixed",
        left: `${startX - 15}px`,
        top: `${startY - 15}px`,
        width: "30px",
        height: "30px",
        borderRadius: "9999px",
        zIndex: "200",
        pointerEvents: "none",
        background:
            "radial-gradient(circle at 30% 30%, #ffffff, #ff6b5b 55%, #14213d)",
        boxShadow: "0 12px 26px -4px rgba(255,107,91,.75)",
    });
    document.body.appendChild(dot);

    const flight = dot.animate(
        [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            {
                transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 110}px) scale(1.2)`,
                opacity: 1,
                offset: 0.45,
            },
            {
                transform: `translate(${dx}px, ${dy}px) scale(0.3)`,
                opacity: 0.7,
            },
        ],
        { duration: 760, easing: "cubic-bezier(.5,.05,.4,1)" },
    );

    flight.onfinish = () => {
        dot.remove();
        target.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.28)" },
                { transform: "scale(1)" },
            ],
            { duration: 400, easing: "cubic-bezier(.2,.9,.3,1.4)" },
        );
    };
}
