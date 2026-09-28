"use client";

import { useActionState, useContext, useEffect, useId } from "react";

import { AuthContext } from "@/app/context/AuthContext";
import { saveAccount, type AccountFormState } from "@/app/zona-de-usuario/cuenta/actions";
import FormField from "@/components/forms/FormField";
import SubmitButton from "@/components/forms/SubmitButton";
import FormStatus from "@/components/forms/FormStatus";
import form from "@/components/forms/Form.module.css";
import styles from "@/app/zona-de-usuario/account.module.css";
import type { AccountUser } from "@/types/account";

// Nombre, apellidos y email. El nombre visible ("Hola, …") pasa a ser
// "Nombre Apellidos" al guardar (lo hace WordPress).
export default function AccountDetailsForm({ user }: { user: AccountUser }) {
    const [state, formAction] = useActionState<AccountFormState, FormData>(saveAccount, { status: "idle" });
    const { refreshUser } = useContext(AuthContext);
    const titleId = useId();

    // Tras guardar, el header también debe enterarse del nombre nuevo
    useEffect(() => {
        if (state.status === "saved") {
            refreshUser();
        }
    }, [state, refreshUser]);

    const values = state.values ?? {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
    };

    return (
        <section className={styles.card} aria-labelledby={titleId}>
            <h2 id={titleId} className={styles.cardTitle}>Datos personales</h2>

            <form action={formAction} className={form.form} noValidate>
                <FormField
                    label="Nombre"
                    name="first_name"
                    autoComplete="given-name"
                    defaultValue={values.first_name}
                    error={state.fields?.first_name}
                    half
                />

                <FormField
                    label="Apellidos"
                    name="last_name"
                    autoComplete="family-name"
                    defaultValue={values.last_name}
                    error={state.fields?.last_name}
                    half
                />

                <FormField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    help="Es con el que inicias sesión. Si lo cambias, avisaremos a la dirección anterior."
                    defaultValue={values.email}
                    error={state.fields?.email}
                    required
                />

                <div className={form.formFooter}>
                    <SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
                    <FormStatus state={state} />
                </div>
            </form>
        </section>
    );
}
