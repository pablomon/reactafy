import type { Metadata } from "next";

import AuthCard from "@/components/auth/AuthCard";
import DemoAccessForm from "@/components/auth/DemoAccessForm";

export const metadata: Metadata = {
    title: "Acceso",
    robots: { index: false, follow: false },
};

type AccessPageProps = {
    searchParams: Promise<{ next?: string }>;
};

// Contraseña para ver la web (DEMO_PASSWORD). proxy.ts manda aquí a
// quien no tenga la cookie de acceso.
export default async function AccessPage({ searchParams }: AccessPageProps) {
    const { next } = await searchParams;

    return (
        <AuthCard title="Acceso" intro="Escribe la contraseña para ver la web.">
            <DemoAccessForm next={next ?? "/"} />
        </AuthCard>
    );
}
