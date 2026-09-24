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
    login: async () => {},
    logout: async () => {},
});

export default function AuthProvider(
    props: AuthProviderProps
) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        async function getUser() {

            const response = await fetch(
                "/api/auth/me"
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setUser(data);
        }

        getUser();

    }, []);

    async function login(
        username: string,
        password: string
    ) {
        const response = await fetch("/api/auth/login", {
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
            "/api/auth/logout",
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
                login,
                logout,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}