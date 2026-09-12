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
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
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

    return (
        <AuthContext.Provider value={{ user }}>
            {props.children}
        </AuthContext.Provider>
    );
}