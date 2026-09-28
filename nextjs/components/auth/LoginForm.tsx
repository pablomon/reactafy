"use client";

import Link from "next/link";
import { useActionState } from "react";

import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import form from "@/components/forms/Form.module.css";
import { login, type AuthFormState } from "@/services/authActions";
import styles from "./Auth.module.css";
import { useSessionStarted } from "./useSessionStarted";

// Formulario de login con Server Action. `next`: adónde volver
// (la página desde la que se vino).
export default function LoginForm({ next }: { next: string }) {
    const [state, formAction] = useActionState<AuthFormState, FormData>(login, { status: "idle" });

    useSessionStarted(state);

    return (
        <form action={formAction} className={`${form.form} ${form.stack}`} noValidate>
            <input type="hidden" name="next" value={next} />

            {state.status === "error" && state.message && (
                <p role="alert" className={styles.alert}>{state.message}</p>
            )}

            <FormField
                label="Email"
                name="username"
                type="text"
                inputMode="email"
                autoComplete="username"
                defaultValue={state.values?.username}
                error={state.fields?.username}
                required
            />

            <FormField
                label="Contraseña"
                name="password"
                type="password"
                autoComplete="current-password"
                error={state.fields?.password}
                required
            />

            <p className={styles.aside}>
                <Link href="/recuperar-contrasena/">¿Has olvidado tu contraseña?</Link>
            </p>

            <SubmitButton pendingText="Entrando…" busy={state.status === "session"} wide>
                Iniciar sesión
            </SubmitButton>
        </form>
    );
}
