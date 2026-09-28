import type { Metadata } from "next";
import Link from "next/link";

import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";
import { redirectIfLoggedIn } from "@/services/redirectIfLoggedIn";
import { safeNext } from "@/utils/safeNext";

export const metadata: Metadata = {
    title: "Crear cuenta",
    robots: { index: false, follow: false },
};

type RegisterPageProps = {
    searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
    const next = safeNext((await searchParams).next);

    await redirectIfLoggedIn(next);

    return (
        <AuthCard
            title="Crear cuenta"
            intro="Guarda tus direcciones y consulta tus pedidos."
            links={
                <p>
                    ¿Ya tienes cuenta?{" "}
                    <Link href={`/login/?next=${encodeURIComponent(next)}`}>Iniciar sesión</Link>
                </p>
            }
        >
            <RegisterForm next={next} />
        </AuthCard>
    );
}
