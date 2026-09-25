"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./Header.module.css";

export type HeaderMenuItem = {
    label: string;
    href: string;
    highlight?: boolean;
};

type MobileMenuProps = {
    items: HeaderMenuItem[];
};

export default function MobileMenu(props: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    // Con el panel abierto: Escape lo cierra y la página no hace scroll.
    useEffect(() => {
        if (!open) return;

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <button
                type="button"
                className={styles.iconButtonReset}
                aria-label="Abrir menú"
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen(true)}
            >
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
                    <path d="M1 1h18M1 8h18M1 15h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {open && (
                <>
                    <div className={styles.overlay} onClick={() => setOpen(false)} />

                    <div
                        id="mobile-menu"
                        className={styles.drawer}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menú"
                    >
                        <button
                            type="button"
                            className={`${styles.iconButtonReset} ${styles.drawerClose}`}
                            aria-label="Cerrar menú"
                            onClick={() => setOpen(false)}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M1 1l14 14M15 1 1 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>

                        <nav aria-label="Principal (móvil)">
                            <ul className={styles.drawerList}>
                                {props.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={styles.drawerLink}
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </>
            )}
        </>
    );
}
