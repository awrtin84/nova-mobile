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
                    DEFAULT: "#0b1020",
                    soft: "#4b5468",
                    mute: "#9aa3b5",
                },
                night: {
                    DEFAULT: "#0a0a1f",
                    700: "#1b1b3d",
                    800: "#12122e",
                },
                brand: {
                    50: "#f4f1ff",
                    100: "#ebe5ff",
                    200: "#d9ceff",
                    300: "#bfabff",
                    400: "#a07eff",
                    500: "#8556ff",
                    600: "#7038f2",
                    700: "#5d2bd1",
                    800: "#4a24a6",
                    900: "#341a73",
                },
                coral: {
                    50: "#fff0f4",
                    100: "#ffdbe6",
                    400: "#ff6b98",
                    500: "#ff3d77",
                    600: "#e8235f",
                    700: "#c4124a",
                },
                mint: {
                    400: "#34e0b4",
                    500: "#19c99a",
                },
                sun: {
                    400: "#ffb84d",
                    500: "#ff9f1a",
                },
            },
            boxShadow: {
                card: "0 1px 2px rgba(11,16,32,.04), 0 10px 30px -14px rgba(11,16,32,.16)",
                lift: "0 2px 6px rgba(11,16,32,.06), 0 22px 44px -18px rgba(112,56,242,.45)",
                glow: "0 0 0 1px rgba(255,255,255,.08) inset, 0 18px 50px -12px rgba(133,86,255,.55)",
                dock: "0 18px 50px -12px rgba(8,8,32,.55)",
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
