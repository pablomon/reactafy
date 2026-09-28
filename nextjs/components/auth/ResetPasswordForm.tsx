"use client";

import Link from "next/link";
import { useActionState } from "react";

import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import form from "@/components/forms/Form.module.css";
import { resetPassword, type AuthFormState } from "@/services/authActions";
import styles from "./Auth.module.css";
import { useSessionStarted } from "./useSessionStarted";

type ResetPasswordFormProps = {
    // "key" es un nombre reservado en React, por eso resetKey
    resetKey: string;
    login: string;
};

// La clave y el login del enlace van "atados" a la acción con bind:
// no son campos del formulario.
export default function ResetPasswordForm({ resetKey, login }: ResetPasswordFormProps) {
    const [state, formAction] = useActionState<AuthFormState, FormData>(
        resetPassword.bind(null, { key: resetKey, login }),
        { status: "idle" }
    );

    useSessionStarted(state);

    if (state.status === "done") {
        return (
            <div role="status">
                <p className={styles.done}>{state.message}</p>
                <Link href="/login/" className={styles.inlineLink}>Iniciar sesión</Link>
            </div>
        );
    }

    return (
        <form action={formAction} className={`${form.form} ${form.stack}`} noValidate>
            {state.status === "error" && state.message && (
                <p role="alert" className={styles.alert}>
                    {state.message}{" "}
                    {state.invalidLink && (
                        <Link href="/recuperar-contrasena/" className={styles.inlineLink}>
                            Solicitar un enlace nuevo
                        </Link>
                    )}
                </p>
            )}

            <FormField
                label="Contraseña nueva"
                name="password"
                type="password"
                autoComplete="new-password"
                help="Mínimo 8 caracteres, sin acentos, eñes ni emojis."
                error={state.fields?.password}
                required
            />

            <FormField
                label="Repite la contraseña"
                name="confirm"
                type="password"
                autoComplete="new-password"
                error={state.fields?.confirm}
                required
            />

            <SubmitButton pendingText="Guardando…" busy={state.status === "session"} wide>
                Guardar contraseña
            </SubmitButton>
        </form>
    );
}
