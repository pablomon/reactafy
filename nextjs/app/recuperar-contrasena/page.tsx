import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <main>
            <h1>Recupera tu contraseña</h1>

            <p>
                Escribe el email de tu cuenta y te enviaremos un enlace
                para elegir una contraseña nueva.
            </p>

            <ForgotPasswordForm />
        </main>
    );
}
