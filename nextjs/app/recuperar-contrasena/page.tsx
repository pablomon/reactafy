import type { Metadata } from "next";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "Recuperar contraseña",
    robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Recupera tu contraseña"
            intro="Escribe el email de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva."
            links={<Link href="/login/">Volver a iniciar sesión</Link>}
        >
            <ForgotPasswordForm />
        </AuthCard>
    );
}
