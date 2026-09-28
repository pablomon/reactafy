"use client";

import { useActionState } from "react";

import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import form from "@/components/forms/Form.module.css";
import { forgotPassword, type AuthFormState } from "@/services/authActions";
import styles from "./Auth.module.css";

export default function ForgotPasswordForm() {
    const [state, formAction] = useActionState<AuthFormState, FormData>(forgotPassword, { status: "idle" });

    // Mismo mensaje exista o no la cuenta
    if (state.status === "done") {
        return <p role="status" className={styles.done}>{state.message}</p>;
    }

    return (
        <form action={formAction} className={`${form.form} ${form.stack}`} noValidate>
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

            <SubmitButton pendingText="Enviando…" wide>
                Enviar enlace
            </SubmitButton>
        </form>
    );
}
