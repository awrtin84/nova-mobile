import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "نوا موبایل",
        short_name: "نوا موبایل",
        description: "فروشگاه آنلاین موبایل و لوازم جانبی",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f4ede0",
        theme_color: "#14213d",
        lang: "fa",
        dir: "rtl",
        icons: [
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "maskable",
            },
        ],
    };
}
