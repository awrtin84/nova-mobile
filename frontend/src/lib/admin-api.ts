import { API_URL, ApiError } from "./api";
import type { Order, Product, ProductDetail, ProductPage } from "./types";

const TOKEN_KEY = "nova-admin-token";
export const LOGOUT_EVENT = "nova-admin-logout";

export function getToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {}
}

export type DayPoint = { date: string; revenue: number; orders: number };

export type Stats = {
    revenue: number;
    orders: number;
    pending: number;
    products: number;
    out_of_stock: number;
    by_status: Record<string, number>;
    low_stock: Product[];
    recent_orders: Order[];
    daily: DayPoint[];
};

export type OrderPage = {
    items: Order[];
    total: number;
    page: number;
    pages: number;
};

export type ProductInput = {
    name: string;
    name_en: string;
    brand: string;
    category: string;
    price: number;
    discount_percent: number;
    stock: number;
    hue: number;
    description: string;
    specs: Record<string, string>;
    colors: { name: string; hex: string }[];
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/admin${path}`, {
        cache: "no-store",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init?.headers ?? {}),
        },
    });

    if (response.status === 401 && path !== "/login") {
        setToken(null);
        window.dispatchEvent(new Event(LOGOUT_EVENT));
        throw new ApiError("نشست شما منقضی شده است، دوباره وارد شوید", 401);
    }

    if (!response.ok) {
        let message = "خطایی رخ داد، دوباره تلاش کنید";
        try {
            const body = await response.json();
            if (typeof body.detail === "string") message = body.detail;
            else if (Array.isArray(body.detail))
                message = "اطلاعات واردشده معتبر نیست؛ فیلدها را بررسی کنید";
        } catch {}
        throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
}

const json = (body: unknown) => JSON.stringify(body);

export const admin = {
    login: (password: string) =>
        call<{ token: string }>("/login", {
            method: "POST",
            body: json({ password }),
        }),
    stats: () => call<Stats>("/stats"),
    products: (q: string, page: number) =>
        call<ProductPage>(`/products?q=${encodeURIComponent(q)}&page=${page}`),
    product: (id: string | number) => call<ProductDetail>(`/products/${id}`),
    createProduct: (input: ProductInput) =>
        call<ProductDetail>("/products", { method: "POST", body: json(input) }),
    updateProduct: (id: number, input: ProductInput) =>
        call<ProductDetail>(`/products/${id}`, {
            method: "PUT",
            body: json(input),
        }),
    deleteProduct: (id: number) =>
        call<{ ok: boolean }>(`/products/${id}`, { method: "DELETE" }),
    orders: (status: string, page: number) =>
        call<OrderPage>(
            `/orders?status=${encodeURIComponent(status)}&page=${page}`,
        ),
    setStatus: (code: string, status: string) =>
        call<Order>(`/orders/${code}/status`, {
            method: "PATCH",
            body: json({ status }),
        }),
};
