import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AccountNav from "@/components/account/AccountNav";
import { getMe } from "@/services/accountService";
import styles from "./account.module.css";
import { loginUrl } from "@/services/loginRedirect";

// Páginas privadas: fuera de Google
export const metadata: Metadata = {
    title: "Mi cuenta",
    robots: { index: false, follow: false },
};

// Layout de toda la zona de usuario (Server Component).
// La sesión se comprueba AQUÍ, en el servidor, antes de pintar nada:
// sin sesión (o con el token caducado) se va a /login/ sin enseñar
// ni un "Cargando…". Las páginas de dentro pueden dar por hecho que
// hay usuario.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    const me = await getMe();

    if (!me.ok) {
        redirect(await loginUrl());
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <aside className={styles.sidebar}>
                    <p className={styles.hello}>
                        Hola, <strong>{me.data.name}</strong>
                    </p>
                    <p className={styles.email}>{me.data.email}</p>

                    <AccountNav />
                </aside>

                <div className={styles.content}>{children}</div>
            </div>
        </main>
    );
}
