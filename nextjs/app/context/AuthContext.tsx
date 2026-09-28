"use client";

import {
    createContext,
    useCallback,
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
    // Vuelve a leer el usuario de la cookie. Se llama después de que
    // una Server Action abra sesión (login, registro, nueva
    // contraseña) o cambie el nombre: la cookie la pone el servidor y
    // el navegador no se entera solo.
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    refreshUser: async () => {},
    logout: async () => {},
});

export default function AuthProvider(
    props: AuthProviderProps
) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/me/", { cache: "no-store" });

            setUser(response.ok ? await response.json() : null);
        } catch (error) {
            console.error("Failed to load user:", error);
        } finally {
            // Con sesión, sin sesión o con error de red: ya sabemos.
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Primera carga: ¿hay sesión?
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshUser();
    }, [refreshUser]);

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
                refreshUser,
                logout,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}
