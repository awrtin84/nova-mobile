import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Vazirmatn Variable",
                    "Vazirmatn",
                    "system-ui",
                    "sans-serif",
                ],
            },
            colors: {
                ink: {
                    DEFAULT: "#14213d",
                    soft: "#4a5673",
                    mute: "#8e98b0",
                },
                night: {
                    DEFAULT: "#0d1527",
                    700: "#1e2d52",
                    800: "#111c36",
                },
                cream: {
                    50: "#faf6ee",
                    100: "#f4ede0",
                    200: "#e9dfcc",
                    300: "#d9ccb2",
                },
                slate: {
                    50: "#f8f4ea",
                    100: "#efe7d8",
                    200: "#e3d9c5",
                    300: "#cfc3aa",
                    400: "#9aa0b3",
                    500: "#6b7690",
                    600: "#4a5673",
                    700: "#34405c",
                    800: "#1f2b48",
                    900: "#14213d",
                },
                brand: {
                    50: "#f1f3f8",
                    100: "#e1e6f0",
                    200: "#c3cce0",
                    300: "#93a2c4",
                    400: "#5b7bc0",
                    500: "#2f4272",
                    600: "#14213d",
                    700: "#101a31",
                    800: "#0c1425",
                    900: "#080e1a",
                },
                coral: {
                    50: "#fff1ee",
                    100: "#ffdfd9",
                    400: "#ff8a7c",
                    500: "#ff6b5b",
                    600: "#f04a38",
                    700: "#c93222",
                },
                mint: {
                    400: "#34e0b4",
                    500: "#19c99a",
                },
                sun: {
                    400: "#f6c25b",
                    500: "#f2a93b",
                },
            },
            boxShadow: {
                card: "0 1px 2px rgba(20,33,61,.05), 0 10px 30px -14px rgba(20,33,61,.18)",
                lift: "0 2px 6px rgba(20,33,61,.06), 0 22px 44px -18px rgba(255,107,91,.5)",
                glow: "0 0 0 1px rgba(255,255,255,.08) inset, 0 18px 50px -12px rgba(255,107,91,.55)",
                dock: "0 18px 50px -12px rgba(8,14,32,.55)",
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },
            keyframes: {
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(14px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                pop: {
                    "0%": { transform: "scale(.6)", opacity: "0" },
                    "60%": { transform: "scale(1.12)" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            animation: {
                "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both",
                float: "float 6s ease-in-out infinite",
                pop: "pop .35s cubic-bezier(.2,.9,.3,1.4) both",
            },
        },
    },
    plugins: [],
};

export default config;
