"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { ApiError } from "@/lib/api";
import { userApi, type User } from "@/lib/user-api";

type UserValue = {
    user: User | null;
    token: string | null;
    ready: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setUser: (user: User) => void;
};

const STORAGE_KEY = "nova-user-v1";

const UserContext = createContext<UserValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let stored: { token: string; user: User } | null = null;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) stored = JSON.parse(raw);
        } catch {}

        if (!stored?.token) {
            setReady(true);
            return;
        }

        setToken(stored.token);
        setUserState(stored.user);
        setReady(true);

        userApi
            .me(stored.token)
            .then((fresh) => setUserState(fresh))
            .catch((error) => {
                if (error instanceof ApiError && error.status === 401) {
                    setToken(null);
                    setUserState(null);
                    try {
                        localStorage.removeItem(STORAGE_KEY);
                    } catch {}
                }
            });
    }, []);

    useEffect(() => {
        if (!ready) return;
        try {
            if (token && user)
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ token, user }),
                );
        } catch {}
    }, [token, user, ready]);

    const login = useCallback((nextToken: string, nextUser: User) => {
        setToken(nextToken);
        setUserState(nextUser);
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUserState(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {}
    }, []);

    const setUser = useCallback((next: User) => setUserState(next), []);

    const value = useMemo(
        () => ({ user, token, ready, login, logout, setUser }),
        [user, token, ready, login, logout, setUser],
    );

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
}
