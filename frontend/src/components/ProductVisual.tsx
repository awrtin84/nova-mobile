type Props = {
    kind: string;
    hue: number;
    className?: string;
    accent?: string;
};

function shapes(kind: string, body: string, screen: string, edge: string) {
    switch (kind) {
        case "phone":
            return (
                <g>
                    <rect
                        x="132"
                        y="38"
                        width="96"
                        height="204"
                        rx="22"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="139"
                        y="46"
                        width="82"
                        height="188"
                        rx="16"
                        fill={screen}
                    />
                    <rect
                        x="166"
                        y="52"
                        width="28"
                        height="7"
                        rx="3.5"
                        fill={body}
                    />
                    <rect
                        x="148"
                        y="70"
                        width="64"
                        height="64"
                        rx="12"
                        fill="#ffffff"
                        opacity=".16"
                    />
                    <rect
                        x="148"
                        y="144"
                        width="40"
                        height="6"
                        rx="3"
                        fill="#ffffff"
                        opacity=".4"
                    />
                    <rect
                        x="148"
                        y="158"
                        width="64"
                        height="6"
                        rx="3"
                        fill="#ffffff"
                        opacity=".22"
                    />
                    <rect
                        x="148"
                        y="172"
                        width="52"
                        height="6"
                        rx="3"
                        fill="#ffffff"
                        opacity=".22"
                    />
                </g>
            );
        case "tablet":
            return (
                <g>
                    <rect
                        x="88"
                        y="58"
                        width="184"
                        height="164"
                        rx="18"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="97"
                        y="67"
                        width="166"
                        height="146"
                        rx="10"
                        fill={screen}
                    />
                    <rect
                        x="111"
                        y="84"
                        width="70"
                        height="46"
                        rx="8"
                        fill="#ffffff"
                        opacity=".18"
                    />
                    <rect
                        x="191"
                        y="84"
                        width="58"
                        height="10"
                        rx="5"
                        fill="#ffffff"
                        opacity=".35"
                    />
                    <rect
                        x="191"
                        y="104"
                        width="44"
                        height="8"
                        rx="4"
                        fill="#ffffff"
                        opacity=".2"
                    />
                    <rect
                        x="111"
                        y="146"
                        width="138"
                        height="8"
                        rx="4"
                        fill="#ffffff"
                        opacity=".2"
                    />
                    <rect
                        x="111"
                        y="164"
                        width="110"
                        height="8"
                        rx="4"
                        fill="#ffffff"
                        opacity=".2"
                    />
                </g>
            );
        case "watch":
            return (
                <g>
                    <rect
                        x="152"
                        y="26"
                        width="56"
                        height="62"
                        rx="12"
                        fill={edge}
                    />
                    <rect
                        x="152"
                        y="192"
                        width="56"
                        height="62"
                        rx="12"
                        fill={edge}
                    />
                    <rect
                        x="124"
                        y="80"
                        width="112"
                        height="120"
                        rx="30"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="133"
                        y="89"
                        width="94"
                        height="102"
                        rx="23"
                        fill={screen}
                    />
                    <circle
                        cx="180"
                        cy="140"
                        r="26"
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity=".5"
                        strokeWidth="4"
                    />
                    <path
                        d="M180 124v16l10 7"
                        stroke="#ffffff"
                        strokeOpacity=".85"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <rect
                        x="236"
                        y="122"
                        width="8"
                        height="26"
                        rx="4"
                        fill={edge}
                    />
                </g>
            );
        case "earbuds":
            return (
                <g>
                    <rect
                        x="108"
                        y="96"
                        width="144"
                        height="116"
                        rx="38"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <path d="M108 140h144" stroke={edge} strokeWidth="2" />
                    <circle cx="180" cy="176" r="6" fill={screen} />
                    <g transform="rotate(-18 150 78)">
                        <rect
                            x="140"
                            y="30"
                            width="22"
                            height="58"
                            rx="11"
                            fill="#ffffff"
                            stroke={edge}
                            strokeWidth="2"
                        />
                        <circle
                            cx="151"
                            cy="96"
                            r="14"
                            fill="#ffffff"
                            stroke={edge}
                            strokeWidth="2"
                        />
                    </g>
                    <g transform="rotate(18 210 78)">
                        <rect
                            x="198"
                            y="30"
                            width="22"
                            height="58"
                            rx="11"
                            fill="#ffffff"
                            stroke={edge}
                            strokeWidth="2"
                        />
                        <circle
                            cx="209"
                            cy="96"
                            r="14"
                            fill="#ffffff"
                            stroke={edge}
                            strokeWidth="2"
                        />
                    </g>
                </g>
            );
        case "charger":
            return (
                <g>
                    <rect
                        x="132"
                        y="62"
                        width="96"
                        height="112"
                        rx="20"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="152"
                        y="26"
                        width="10"
                        height="38"
                        rx="3"
                        fill={edge}
                    />
                    <rect
                        x="198"
                        y="26"
                        width="10"
                        height="38"
                        rx="3"
                        fill={edge}
                    />
                    <rect
                        x="156"
                        y="108"
                        width="48"
                        height="20"
                        rx="10"
                        fill={screen}
                    />
                    <rect
                        x="164"
                        y="114"
                        width="32"
                        height="8"
                        rx="4"
                        fill="#ffffff"
                        opacity=".35"
                    />
                    <path
                        d="M184 142l-8 14h12l-8 14"
                        stroke="#ffffff"
                        strokeOpacity=".7"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </g>
            );
        case "cable":
            return (
                <g>
                    <path
                        d="M70 210c60 0 40-110 100-110s20 110 120 60"
                        stroke={body}
                        strokeWidth="9"
                        strokeLinecap="round"
                        fill="none"
                    />
                    <path
                        d="M70 210c60 0 40-110 100-110s20 110 120 60"
                        stroke={edge}
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        opacity=".4"
                    />
                    <rect
                        x="44"
                        y="196"
                        width="40"
                        height="28"
                        rx="8"
                        fill={screen}
                    />
                    <rect
                        x="30"
                        y="203"
                        width="18"
                        height="14"
                        rx="4"
                        fill={edge}
                    />
                    <rect
                        x="278"
                        y="146"
                        width="40"
                        height="28"
                        rx="8"
                        fill={screen}
                    />
                    <rect
                        x="312"
                        y="153"
                        width="18"
                        height="14"
                        rx="4"
                        fill={edge}
                    />
                </g>
            );
        case "powerbank":
            return (
                <g>
                    <rect
                        x="116"
                        y="52"
                        width="128"
                        height="176"
                        rx="24"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="136"
                        y="72"
                        width="88"
                        height="40"
                        rx="12"
                        fill={screen}
                    />
                    <rect
                        x="146"
                        y="86"
                        width="52"
                        height="12"
                        rx="6"
                        fill="#ffffff"
                        opacity=".5"
                    />
                    <rect
                        x="136"
                        y="132"
                        width="26"
                        height="8"
                        rx="4"
                        fill={edge}
                    />
                    <rect
                        x="136"
                        y="148"
                        width="26"
                        height="8"
                        rx="4"
                        fill={edge}
                    />
                    <path
                        d="M190 160l-12 24h20l-12 24"
                        stroke="#ffffff"
                        strokeOpacity=".75"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </g>
            );
        case "case":
            return (
                <g>
                    <rect
                        x="128"
                        y="34"
                        width="104"
                        height="212"
                        rx="26"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="140"
                        y="46"
                        width="52"
                        height="56"
                        rx="16"
                        fill={screen}
                    />
                    <circle cx="156" cy="62" r="9" fill={edge} />
                    <circle cx="176" cy="62" r="9" fill={edge} />
                    <circle cx="166" cy="84" r="9" fill={edge} />
                    <circle
                        cx="180"
                        cy="200"
                        r="22"
                        fill="none"
                        stroke="#ffffff"
                        strokeOpacity=".45"
                        strokeWidth="3"
                    />
                </g>
            );
        case "protector":
            return (
                <g>
                    <rect
                        x="132"
                        y="38"
                        width="96"
                        height="204"
                        rx="22"
                        fill="#ffffff"
                        fillOpacity=".35"
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <rect
                        x="142"
                        y="50"
                        width="76"
                        height="180"
                        rx="14"
                        fill={screen}
                        fillOpacity=".5"
                    />
                    <path
                        d="M150 70l44-24M150 112l64-40M150 154l64-40"
                        stroke="#ffffff"
                        strokeOpacity=".7"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M110 150l16 16 30-36"
                        stroke="#16a34a"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        transform="translate(120 70)"
                    />
                </g>
            );
        case "speaker":
            return (
                <g>
                    <rect
                        x="94"
                        y="84"
                        width="172"
                        height="112"
                        rx="40"
                        fill={body}
                        stroke={edge}
                        strokeWidth="2"
                    />
                    <circle cx="180" cy="140" r="32" fill={screen} />
                    <circle
                        cx="180"
                        cy="140"
                        r="16"
                        fill="#ffffff"
                        opacity=".22"
                    />
                    <circle
                        cx="180"
                        cy="140"
                        r="5"
                        fill="#ffffff"
                        opacity=".6"
                    />
                    <rect
                        x="120"
                        y="112"
                        width="12"
                        height="56"
                        rx="6"
                        fill={edge}
                        opacity=".4"
                    />
                    <rect
                        x="228"
                        y="112"
                        width="12"
                        height="56"
                        rx="6"
                        fill={edge}
                        opacity=".4"
                    />
                    <rect
                        x="170"
                        y="70"
                        width="20"
                        height="14"
                        rx="7"
                        fill={edge}
                    />
                </g>
            );
        default:
            return (
                <rect
                    x="120"
                    y="70"
                    width="120"
                    height="140"
                    rx="20"
                    fill={body}
                />
            );
    }
}

export default function ProductVisual({
    kind,
    hue,
    className = "",
    accent,
}: Props) {
    const id = `pv-${kind}-${hue}`;
    const body = accent ?? `url(#${id}-body)`;
    const screen = `hsl(${hue} 78% 52%)`;
    const edge = `hsl(${hue} 24% 10%)`;

    return (
        <svg
            viewBox="0 0 360 280"
            role="img"
            aria-hidden="true"
            className={`h-full w-full ${className}`}
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={`hsl(${hue} 90% 96%)`} />
                    <stop
                        offset=".55"
                        stopColor={`hsl(${(hue + 25) % 360} 80% 91%)`}
                    />
                    <stop
                        offset="1"
                        stopColor={`hsl(${(hue + 60) % 360} 75% 86%)`}
                    />
                </linearGradient>
                <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor={`hsl(${hue} 26% 40%)`} />
                    <stop offset="1" stopColor={`hsl(${hue} 30% 12%)`} />
                </linearGradient>
                <radialGradient id={`${id}-a`} cx=".5" cy=".5" r=".5">
                    <stop
                        offset="0"
                        stopColor={`hsl(${(hue + 80) % 360} 90% 76%)`}
                        stopOpacity=".75"
                    />
                    <stop
                        offset="1"
                        stopColor={`hsl(${(hue + 80) % 360} 90% 76%)`}
                        stopOpacity="0"
                    />
                </radialGradient>
                <radialGradient id={`${id}-b`} cx=".5" cy=".5" r=".5">
                    <stop
                        offset="0"
                        stopColor={`hsl(${(hue + 330) % 360} 90% 78%)`}
                        stopOpacity=".7"
                    />
                    <stop
                        offset="1"
                        stopColor={`hsl(${(hue + 330) % 360} 90% 78%)`}
                        stopOpacity="0"
                    />
                </radialGradient>
                <radialGradient id={`${id}-glow`} cx=".5" cy=".5" r=".5">
                    <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="360" height="280" fill={`url(#${id}-bg)`} />
            <circle cx="310" cy="30" r="130" fill={`url(#${id}-a)`} />
            <circle cx="30" cy="260" r="120" fill={`url(#${id}-b)`} />
            <circle cx="180" cy="140" r="122" fill={`url(#${id}-glow)`} />
            <ellipse
                cx="180"
                cy="262"
                rx="84"
                ry="9"
                fill={`hsl(${hue} 45% 28%)`}
                opacity=".16"
            />
            {shapes(kind, body, screen, edge)}
        </svg>
    );
}
