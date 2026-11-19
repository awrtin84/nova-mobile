"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import type { Product } from "@/lib/types";

type WishlistValue = {
    items: Product[];
    ready: boolean;
    has: (id: number) => boolean;
    toggle: (product: Product) => void;
};

const STORAGE_KEY = "nova-wishlist-v1";

const WishlistContext = createContext<WishlistValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) setItems(parsed);
            }
        } catch {}
        setReady(true);
    }, []);

    useEffect(() => {
        if (!ready) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }, [items, ready]);

    const has = useCallback(
        (id: number) => items.some((item) => item.id === id),
        [items],
    );

    const toggle = useCallback((product: Product) => {
        setItems((current) =>
            current.some((item) => item.id === product.id)
                ? current.filter((item) => item.id !== product.id)
                : [product, ...current],
        );
    }, []);

    const value = useMemo(
        () => ({ items, ready, has, toggle }),
        [items, ready, has, toggle],
    );

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context)
        throw new Error("useWishlist must be used within WishlistProvider");
    return context;
}
