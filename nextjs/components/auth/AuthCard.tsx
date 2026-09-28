import type { ReactNode } from "react";

import styles from "./Auth.module.css";

type AuthCardProps = {
    title: string;
    intro?: string;
    children: ReactNode;
    // Enlaces bajo el formulario (crear cuenta, volver al login…)
    links?: ReactNode;
};

// Marco común de las páginas de acceso: tarjeta centrada con título
export default function AuthCard({ title, intro, children, links }: AuthCardProps) {
    return (
        <main className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>{title}</h1>
                {intro && <p className={styles.intro}>{intro}</p>}

                {children}

                {links && <div className={styles.links}>{links}</div>}
            </div>
        </main>
    );
}
