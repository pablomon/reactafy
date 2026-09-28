"use client";

import Link from "next/link";
import { useActionState } from "react";

import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import form from "@/components/forms/Form.module.css";
import { register, type AuthFormState } from "@/services/authActions";
import styles from "./Auth.module.css";
import { useSessionStarted } from "./useSessionStarted";

const PASSWORD_HELP = "Mínimo 8 caracteres, sin acentos, eñes ni emojis.";

export default function RegisterForm({ next }: { next: string }) {
    const [state, formAction] = useActionState<AuthFormState, FormData>(register, { status: "idle" });

    useSessionStarted(state);

    // Cuenta creada pero sin sesión abierta
    if (state.status === "done") {
        return (
            <div role="status">
                <p className={styles.done}>{state.message}</p>
                <Link href={`/login/?next=${encodeURIComponent(next)}`} className={styles.inlineLink}>
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    return (
        <form action={formAction} className={`${form.form} ${form.stack}`} noValidate>
            <input type="hidden" name="next" value={next} />

            {state.status === "error" && state.message && (
                <p role="alert" className={styles.alert}>{state.message}</p>
            )}

            <FormField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.values?.email}
                error={state.fields?.email}
                required
            />

            <FormField
                label="Contraseña"
                name="password"
                type="password"
                autoComplete="new-password"
                help={PASSWORD_HELP}
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

            <SubmitButton pendingText="Creando cuenta…" busy={state.status === "session"} wide>
                Crear cuenta
            </SubmitButton>
        </form>
    );
}
