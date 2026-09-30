"use client";

import { useActionState } from "react";

import { enterDemo, type AccessFormState } from "@/app/acceso/actions";
import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import form from "@/components/forms/Form.module.css";

export default function DemoAccessForm({ next }: { next: string }) {
    const [state, formAction] = useActionState<AccessFormState, FormData>(enterDemo, {});

    return (
        <form action={formAction} className={`${form.form} ${form.stack}`} noValidate>
            <input type="hidden" name="next" value={next} />

            <FormField
                label="Contraseña"
                name="password"
                type="password"
                autoComplete="current-password"
                error={state.error}
                autoFocus
                required
            />

            <SubmitButton pendingText="Entrando…" wide>
                Entrar
            </SubmitButton>
        </form>
    );
}
