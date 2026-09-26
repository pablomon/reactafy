"use client";

import {
    createContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

type User = {
    id: number;
    email: string;
    name: string;
};

type AuthContextType = {
    user: User | null;
    // true mientras se pregunta a /api/auth/me/ al cargar la app:
    // user = null todavía no significa "sin sesión".
    isLoading: boolean;
    login: (
        username: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
});

export default function AuthProvider(
    props: AuthProviderProps
) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {

        async function getUser() {
            try {
                const response = await fetch(
                    "/api/auth/me/"
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setUser(data);
            } catch (error) {
                console.error("Failed to load user:", error);
            } finally {
                // Con sesión, sin sesión o con error de red: ya sabemos.
                setIsLoading(false);
            }
        }

        getUser();

    }, []);

    async function login(
        username: string,
        password: string
    ) {
        const response = await fetch("/api/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ?? "Login failed"
            );
        }

        setUser(data);
    }

    async function logout() {
        const response = await fetch(
            "/api/auth/logout/",
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            throw new Error(
                "Logout failed"
            );
        }

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}