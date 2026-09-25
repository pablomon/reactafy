import Link from "next/link";
import ResetPasswordForm from "@/components/ResetPasswordForm";

type ResetPasswordPageProps = {
    searchParams: Promise<{
        key?: string;
        login?: string;
    }>;
};

// Llega desde el enlace del email de recuperación:
// /nueva-contrasena?key=…&login=…
// Los parámetros se leen aquí, en el servidor, y se pasan al
// formulario; así el componente cliente no depende de useSearchParams.
export default async function ResetPasswordPage(
    props: ResetPasswordPageProps
) {
    const { key, login } = await props.searchParams;

    if (!key || !login) {
        return (
            <main>
                <h1>Enlace no válido</h1>

                <p>
                    El enlace para restablecer la contraseña no es válido
                    o está incompleto.
                </p>

                <Link href="/recuperar-contrasena">
                    Solicitar un enlace nuevo
                </Link>
            </main>
        );
    }

    return (
        <main>
            <h1>Elige una contraseña nueva</h1>

            <ResetPasswordForm
                resetKey={key}
                login={login}
            />
        </main>
    );
}
