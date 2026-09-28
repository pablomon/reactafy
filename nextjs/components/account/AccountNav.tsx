"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useState } from "react";

import { AuthContext } from "@/app/context/AuthContext";
import styles from "@/app/zona-de-usuario/account.module.css";

// Secciones de la zona de usuario
const SECTIONS = [
    { href: "/zona-de-usuario/", label: "Resumen", exact: true },
    { href: "/zona-de-usuario/pedidos/", label: "Pedidos", exact: false },
    { href: "/zona-de-usuario/entrega/", label: "Entrega", exact: false },
    { href: "/zona-de-usuario/facturacion/", label: "Facturación", exact: false },
    { href: "/zona-de-usuario/cuenta/", label: "Cuenta", exact: false },
];

// Menú de la zona de usuario. Es componente de cliente solo por dos
// cosas: saber qué sección está activa (usePathname) y cerrar sesión.
export default function AccountNav() {
    const pathname = usePathname();
    const { logout } = useContext(AuthContext);
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        setLoggingOut(true);

        try {
            await logout();
            // Recarga completa: no queda nada de la sesión en el navegador
            // (caché de páginas, usuario, carrito). Más lento que navegar,
            // pero cerrar sesión es raro y así es imposible ver datos viejos
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- recarga completa a propósito
            window.location.assign("/");
        } catch {
            setLoggingOut(false);
        }
    }

    return (
        <nav aria-label="Mi cuenta">
            <ul className={styles.navList}>
                {SECTIONS.map((section) => {
                    const active = section.exact
                        ? pathname === section.href
                        : pathname.startsWith(section.href);

                    return (
                        <li key={section.href}>
                            <Link
                                href={section.href}
                                className={styles.navLink}
                                aria-current={active ? "page" : undefined}
                            >
                                {section.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <button
                type="button"
                className={styles.logout}
                onClick={handleLogout}
                disabled={loggingOut}
            >
                {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
        </nav>
    );
}
