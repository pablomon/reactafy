"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthContext } from "@/app/context/AuthContext";
import styles from "./page.module.css";

// Zona de usuario provisional (misma URL que aguafy.com), a la espera
// del diseño real con pedidos y direcciones.
//
// La redirección a /login/ es solo de interfaz: los datos protegidos
// los protege la API en el servidor, no esta página.
export default function ZonaDeUsuarioPage() {
    const { user, isLoading, logout } = useContext(AuthContext);
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    // Sin sesión (y ya comprobado): al login.
    useEffect(() => {
        if (!isLoading && !user && !loggingOut) {
            router.replace("/login/");
        }
    }, [isLoading, user, loggingOut, router]);

    async function handleLogout() {
        setLoggingOut(true);

        try {
            await logout();
            router.replace("/");
        } catch {
            setLoggingOut(false);
        }
    }

    if (isLoading || !user) {
        return (
            <main className={styles.container}>
                <p>Cargando…</p>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Hola, {user.name}</h1>

            <p className={styles.email}>{user.email}</p>

            <p className={styles.soon}>
                Próximamente: mis pedidos y direcciones.
            </p>

            <button
                type="button"
                className={styles.logout}
                onClick={handleLogout}
                disabled={loggingOut}
            >
                {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
        </main>
    );
}
