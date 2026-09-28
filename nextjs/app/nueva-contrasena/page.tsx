import type { Metadata } from "next";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Nueva contraseña",
    robots: { index: false, follow: false },
};

type ResetPasswordPageProps = {
    searchParams: Promise<{
        key?: string;
        login?: string;
    }>;
};

// Llega desde el enlace del email de recuperación:
// /nueva-contrasena/?key=…&login=…
// Los parámetros se leen aquí, en el servidor, y se pasan al formulario.
export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { key, login } = await searchParams;

    if (!key || !login) {
        return (
            <AuthCard
                title="Enlace no válido"
                intro="El enlace para elegir una contraseña nueva no es válido o está incompleto."
                links={<Link href="/recuperar-contrasena/">Solicitar un enlace nuevo</Link>}
            >
                {null}
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Elige una contraseña nueva">
            <ResetPasswordForm resetKey={key} login={login} />
        </AuthCard>
    );
}
