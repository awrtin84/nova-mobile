"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export type CartLine = {
    key: string;
    productId: number;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    color: string;
    stock: number;
    kind: string;
    hue: number;
};

type AddInput = Omit<CartLine, "key" | "quantity"> & { quantity?: number };

type CartContextValue = {
    lines: CartLine[];
    ready: boolean;
    count: number;
    subtotal: number;
    add: (input: AddInput) => void;
    setQuantity: (key: string, quantity: number) => void;
    remove: (key: string) => void;
    clear: () => void;
    toast: string | null;
};

const STORAGE_KEY = "nova-cart-v1";
const MAX_PER_LINE = 10;

const CartContext = createContext<CartContextValue | null>(null);

function lineKey(productId: number, color: string) {
    return `${productId}::${color}`;
}

function totalFor(lines: CartLine[], productId: number) {
    return lines
        .filter((l) => l.productId === productId)
        .reduce((sum, l) => sum + l.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [lines, setLines] = useState<CartLine[]>([]);
    const [ready, setReady] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [lastToast, setLastToast] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setLines(parsed);
            }
        } catch {}
        setReady(true);
    }, []);

    useEffect(() => {
        if (!ready) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
        } catch {}
    }, [lines, ready]);

    useEffect(() => {
        if (!toast) return;
        setLastToast(toast);
        const timer = setTimeout(() => setToast(null), 2600);
        return () => clearTimeout(timer);
    }, [toast]);

    const add = useCallback((input: AddInput) => {
        const quantity = input.quantity ?? 1;
        setLines((current) => {
            const key = lineKey(input.productId, input.color);
            const limit = Math.min(MAX_PER_LINE, input.stock);
            const inCart = totalFor(current, input.productId);
            const room = Math.max(0, limit - inCart);
            if (room === 0) {
                setToast("به سقف موجودی این کالا رسیدید");
                return current;
            }
            const toAdd = Math.min(quantity, room);
            setToast("به سبد خرید اضافه شد");
            const existing = current.find((l) => l.key === key);
            if (existing) {
                return current.map((l) =>
                    l.key === key ? { ...l, quantity: l.quantity + toAdd } : l,
                );
            }
            return [...current, { ...input, key, quantity: toAdd }];
        });
    }, []);

    const setQuantity = useCallback((key: string, quantity: number) => {
        setLines((current) => {
            const target = current.find((l) => l.key === key);
            if (!target) return current;
            const others =
                totalFor(current, target.productId) - target.quantity;
            const limit = Math.max(
                0,
                Math.min(MAX_PER_LINE, target.stock) - others,
            );
            const next = Math.max(1, Math.min(quantity, limit));
            return current.map((l) =>
                l.key === key ? { ...l, quantity: next } : l,
            );
        });
    }, []);

    const remove = useCallback((key: string) => {
        setLines((current) => current.filter((l) => l.key !== key));
    }, []);

    const clear = useCallback(() => setLines([]), []);

    const value = useMemo<CartContextValue>(
        () => ({
            lines,
            ready,
            count: lines.reduce((sum, l) => sum + l.quantity, 0),
            subtotal: lines.reduce((sum, l) => sum + l.quantity * l.price, 0),
            add,
            setQuantity,
            remove,
            clear,
            toast,
        }),
        [lines, ready, add, setQuantity, remove, clear, toast],
    );

    return (
        <CartContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                className={`pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 transition duration-300 md:bottom-8 ${
                    toast
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                }`}
            >
                <div className="flex items-center gap-2.5 rounded-full bg-night/90 py-2.5 pe-5 ps-2.5 text-sm font-bold text-white shadow-dock ring-1 ring-white/10 backdrop-blur-xl">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-mint-400 to-mint-500">
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                        </svg>
                    </span>
                    {toast ?? lastToast}
                </div>
            </div>
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
