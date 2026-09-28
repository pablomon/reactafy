"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import CloseButton from "./CloseButton";

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
    const closeRef = useRef<HTMLButtonElement>(null);

    // Con el panel abierto: foco en la X, Escape lo cierra y la página
    // no hace scroll.
    useEffect(() => {
        if (!open) return;

        closeRef.current?.focus();

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

            {/* Siempre montado (no {open && …}) para que el CSS pueda animar
                la entrada y la salida según data-open. Cerrado lleva `inert`:
                no se puede tabular dentro ni lo leen los lectores. */}
            <div
                className={styles.overlay}
                data-open={open}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            <div
                id="mobile-menu"
                className={styles.drawer}
                data-open={open}
                role="dialog"
                aria-modal="true"
                aria-label="Menú"
                inert={!open}
            >
                <CloseButton
                    ref={closeRef}
                    className={styles.drawerClose}
                    aria-label="Cerrar menú"
                    onClick={() => setOpen(false)}
                />

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
    );
}
