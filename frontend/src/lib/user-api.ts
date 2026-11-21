import { API_URL, ApiError, DEMO } from "./api";
import type { Order } from "./types";

export type User = { id: number; phone: string; name: string };

export type OtpInfo = {
    phone: string;
    is_new: boolean;
    expires_in: number;
    resend_in: number;
    dev_code?: string;
};

export type VerifyResult = { token: string; user: User; created: boolean };

const FA = "۰۱۲۳۴۵۶۷۸۹";
const AR = "٠١٢٣٤٥٦٧٨٩";

export function toEn(value: string): string {
    return value
        .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));
}

export function toFa(value: string): string {
    return value.replace(/\d/g, (d) => FA[Number(d)]);
}

export function normalizePhone(raw: string): string | null {
    let digits = toEn(raw).replace(/\D/g, "");
    if (digits.startsWith("0098")) digits = "0" + digits.slice(4);
    else if (digits.startsWith("98") && digits.length === 12)
        digits = "0" + digits.slice(2);
    else if (digits.length === 10 && digits.startsWith("9"))
        digits = "0" + digits;
    return /^09\d{9}$/.test(digits) ? digits : null;
}

async function call<T>(
    path: string,
    init?: RequestInit,
    token?: string,
): Promise<T> {
    const response = await fetch(`${API_URL}/api/account${path}`, {
        cache: "no-store",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

const live = {
    requestOtp: (phone: string) =>
        call<OtpInfo>("/request-otp", {
            method: "POST",
            body: JSON.stringify({ phone }),
        }),
    verify: (phone: string, code: string) =>
        call<VerifyResult>("/verify", {
            method: "POST",
            body: JSON.stringify({ phone, code }),
        }),
    me: (token: string) => call<User>("/me", undefined, token),
    updateName: (token: string, name: string) =>
        call<User>(
            "/me",
            { method: "PUT", body: JSON.stringify({ name }) },
            token,
        ),
    orders: (token: string) => call<Order[]>("/orders", undefined, token),
};

const USERS_KEY = "nova-demo-users-v1";
const VISITOR_KEY = "nova-demo-orders-v1";
const demoCodes = new Map<string, { code: string; expires: number }>();

type DemoUsers = Record<string, { id: number; name: string }>;

function readUsers(): DemoUsers {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? (JSON.parse(raw) as DemoUsers) : {};
    } catch {
        return {};
    }
}

function writeUsers(users: DemoUsers) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
}

function demoUser(phone: string): User | null {
    const found = readUsers()[phone];
    return found ? { id: found.id, phone, name: found.name } : null;
}

function phoneFromToken(token: string): string {
    return token.startsWith("demo:") ? token.slice(5) : "";
}

const demo = {
    requestOtp: async (phone: string): Promise<OtpInfo> => {
        const code = String(10000 + Math.floor(Math.random() * 90000));
        demoCodes.set(phone, { code, expires: Date.now() + 120_000 });
        await new Promise((resolve) => setTimeout(resolve, 650));
        return {
            phone,
            is_new: !demoUser(phone),
            expires_in: 120,
            resend_in: 45,
            dev_code: code,
        };
    },

    verify: async (phone: string, code: string): Promise<VerifyResult> => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const entry = demoCodes.get(phone);
        if (!entry || entry.expires < Date.now())
            throw new ApiError("کد منقضی شده است؛ کد جدید دریافت کنید", 400);
        if (entry.code !== code)
            throw new ApiError("کد وارد شده اشتباه است", 400);
        demoCodes.delete(phone);
        const users = readUsers();
        const created = !users[phone];
        if (created) {
            users[phone] = { id: Object.keys(users).length + 1, name: "" };
            writeUsers(users);
        }
        return {
            token: `demo:${phone}`,
            user: demoUser(phone) as User,
            created,
        };
    },

    me: async (token: string): Promise<User> => {
        const user = demoUser(phoneFromToken(token));
        if (!user) throw new ApiError("نشست شما منقضی شده است", 401);
        return user;
    },

    updateName: async (token: string, name: string): Promise<User> => {
        const phone = phoneFromToken(token);
        const users = readUsers();
        if (!users[phone]) throw new ApiError("نشست شما منقضی شده است", 401);
        users[phone].name = name;
        writeUsers(users);
        return demoUser(phone) as User;
    },

    orders: async (token: string): Promise<Order[]> => {
        const phone = phoneFromToken(token);
        try {
            const raw = localStorage.getItem(VISITOR_KEY);
            const all = raw ? (Object.values(JSON.parse(raw)) as Order[]) : [];
            return all
                .filter((order) => normalizePhone(order.phone) === phone)
                .sort((a, b) => b.created_at.localeCompare(a.created_at));
        } catch {
            return [];
        }
    },
};

export const userApi = DEMO ? demo : live;
