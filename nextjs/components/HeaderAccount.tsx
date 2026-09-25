"use client";

import Link from "next/link";
import { useContext } from "react";

import styles from "./Header.module.css";
import { AuthContext } from "@/app/context/AuthContext";

export default function HeaderAccount() {
    const { user } = useContext(AuthContext);

    return (
        <Link
            href={user ? "/mi-cuenta" : "/login"}
            className={styles.iconLink}
            aria-label={user ? `Mi cuenta (${user.name})` : "Iniciar sesión"}
        >
            <svg width="18" height="21" viewBox="0 0 18 21" fill="none" aria-hidden="true">
                <path
                    d="M16.8 20.5v-4.4c0-.9-.4-1.8-1.1-2.4a3.9 3.9 0 0 0-2.7-1H5.2c-1 0-2 .3-2.7 1-.7.6-1.1 1.5-1.1 2.4v4.4h15.4Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="9.1" cy="5.6" r="4.4" fill="currentColor" />
            </svg>
        </Link>
    );
}
