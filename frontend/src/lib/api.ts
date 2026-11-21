import type {
    Brand,
    Category,
    Config,
    Home,
    Order,
    Product,
    ProductDetail,
    ProductPage,
} from "./types";
import { demoApi } from "./demo-api";

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const isRead = !init?.method || init.method === "GET";
    const response = await fetch(`${API_URL}${path}`, {
        ...(isRead
            ? { next: { revalidate: 30 } }
            : { cache: "no-store" as const }),
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        let message = "خطایی رخ داد، دوباره تلاش کنید";
        try {
            const body = await response.json();
            if (typeof body.detail === "string") message = body.detail;
            else if (Array.isArray(body.detail))
                message = "اطلاعات واردشده معتبر نیست";
        } catch {}
        throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
}

export type ProductQuery = {
    q?: string;
    category?: string;
    brand?: string[];
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    on_sale?: string;
    sort?: string;
    page?: string;
};

export function buildQuery(query: ProductQuery): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === "") continue;
        if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
        else params.set(key, value);
    }
    const text = params.toString();
    return text ? `?${text}` : "";
}

const live = {
    home: () => request<Home>("/api/home"),
    config: () => request<Config>("/api/config"),
    categories: () => request<Category[]>("/api/categories"),
    brands: (category?: string) =>
        request<Brand[]>(
            `/api/brands${category ? `?category=${encodeURIComponent(category)}` : ""}`,
        ),
    products: (query: ProductQuery) =>
        request<ProductPage>(
            `/api/products${buildQuery({ page_size: "12", ...query } as ProductQuery)}`,
        ),
    product: (slug: string) =>
        request<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`),
    related: (slug: string) =>
        request<Product[]>(`/api/products/${encodeURIComponent(slug)}/related`),
    order: (code: string) =>
        request<Order>(`/api/orders/${encodeURIComponent(code)}`),
    createOrder: (body: unknown) =>
        request<Order>("/api/orders", {
            method: "POST",
            body: JSON.stringify(body),
        }),
};

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export const api: typeof live = DEMO
    ? (demoApi as unknown as typeof live)
    : live;
