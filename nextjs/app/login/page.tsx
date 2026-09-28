import type { Metadata } from "next";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { redirectIfLoggedIn } from "@/services/redirectIfLoggedIn";
import { safeNext } from "@/utils/safeNext";

export const metadata: Metadata = {
    title: "Iniciar sesión",
    robots: { index: false, follow: false },
};

type LoginPageProps = {
    searchParams: Promise<{ next?: string }>;
};

// /login/?next=/zona-de-usuario/pedidos/ → tras entrar, vuelve ahí
export default async function LoginPage({ searchParams }: LoginPageProps) {
    const next = safeNext((await searchParams).next);

    await redirectIfLoggedIn(next);

    return (
        <AuthCard
            title="Iniciar sesión"
            links={
                <p>
                    ¿No tienes cuenta?{" "}
                    <Link href={`/registro/?next=${encodeURIComponent(next)}`}>Crear una cuenta</Link>
                </p>
            }
        >
            <LoginForm next={next} />
        </AuthCard>
    );
}
