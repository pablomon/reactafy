"use client";

import { usePathname } from "next/navigation";
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
    // Vuelve a leer el usuario de la cookie (p. ej. tras cambiar el
    // nombre en la zona de usuario).
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

    // ¿Hay sesión? Al cargar y, mientras no haya usuario, en cada cambio
    // de página. Así el header se entera solo cuando algo abre sesión en
    // el servidor (login, registro, nueva contraseña, vuelta del
    // checkout), aunque el formulario que lo hizo ya no exista: tras el
    // login, Next redirige antes de que el formulario reciba respuesta.
    // Sin cookie, /api/auth/me/ responde 401 al momento sin preguntar a
    // WordPress; con usuario cargado no se pregunta nada.
    const pathname = usePathname();
    const hasUser = user !== null;

    useEffect(() => {
        if (!hasUser) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            refreshUser();
        }
    }, [pathname, hasUser, refreshUser]);

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
