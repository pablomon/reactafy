"use client";

import { useActionState, useId } from "react";

import { changePassword, type AccountFormState } from "@/app/zona-de-usuario/cuenta/actions";
import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import FormStatus from "@/components/forms/FormStatus";
import form from "@/components/forms/Form.module.css";
import styles from "@/app/zona-de-usuario/account.module.css";

// Cambiar la contraseña desde la cuenta (sabiendo la actual). Tras
// guardar, React vacía el formulario: justo lo que queremos aquí.
export default function PasswordForm() {
    const [state, formAction] = useActionState<AccountFormState, FormData>(changePassword, { status: "idle" });
    const titleId = useId();

    return (
        <section className={styles.card} aria-labelledby={titleId}>
            <h2 id={titleId} className={styles.cardTitle}>Contraseña</h2>

            <form action={formAction} className={form.form} noValidate>
                <FormField
                    label="Contraseña actual"
                    name="current_password"
                    type="password"
                    autoComplete="current-password"
                    error={state.fields?.current_password}
                    required
                />

                <FormField
                    label="Contraseña nueva"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    help="Mínimo 8 caracteres, sin acentos, eñes ni emojis."
                    error={state.fields?.password}
                    required
                    half
                />

                <FormField
                    label="Repite la contraseña nueva"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    error={state.fields?.confirm}
                    required
                    half
                />

                <div className={form.formFooter}>
                    <SubmitButton pendingText="Cambiando…">Cambiar contraseña</SubmitButton>
                    <FormStatus state={state} savedText="Contraseña cambiada" />
                </div>
            </form>
        </section>
    );
}
