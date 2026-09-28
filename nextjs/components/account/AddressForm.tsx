"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import {
    saveAddress,
    type AddressFormState,
} from "@/app/zona-de-usuario/actions";
import styles from "@/app/zona-de-usuario/account.module.css";
import form from "@/components/forms/Form.module.css";
import type { AddressBlock, AddressField, AddressType } from "@/types/account";

type AddressFormProps = {
    type: AddressType;
    block: AddressBlock;
};

// Formulario de una dirección, pintado a partir de los campos que
// define WooCommerce (block.fields): Next no conoce los campos de
// antemano. Envía con una Server Action (saveAddress).
export default function AddressForm({ type, block }: AddressFormProps) {
    // useActionState: guarda lo que devolvió la última ejecución de la
    // acción (errores, "guardado"…) y nos da `formAction` para el <form>.
    const [state, formAction] = useActionState<AddressFormState, FormData>(
        saveAddress.bind(null, type),
        { status: "idle" }
    );

    // Tras enviar, React vacía el formulario y lo rellena con los
    // defaultValue: por eso salen de lo último enviado/guardado.
    const values = state.values ?? block.values;

    return (
        <section className={styles.card}>
            <form action={formAction} className={form.form} noValidate>
                {block.fields.map((field) => (
                    <Field
                        key={field.key}
                        field={field}
                        value={values[field.key] ?? ""}
                        error={state.fields?.[field.key]}
                    />
                ))}

                <div className={form.formFooter}>
                    <SubmitButton />

                    {/* role="status": los lectores de pantalla lo anuncian */}
                    <p
                        role="status"
                        className={form.formMessage}
                        data-status={state.status}
                    >
                        {state.status === "saved" && "Guardado"}
                        {state.status === "error" && state.message}
                    </p>
                </div>
            </form>
        </section>
    );
}

function Field({ field, value, error }: { field: AddressField; value: string; error?: string }) {
    const id = useId();
    const errorId = `${id}-error`;
    const helpId = `${id}-help`;

    // aria-describedby admite varios ids: ayuda y error se leen al entrar
    const describedBy =
        [field.help && helpId, error && errorId].filter(Boolean).join(" ") || undefined;

    const common = {
        id,
        name: field.key,
        defaultValue: value,
        required: field.required,
        autoComplete: field.autocomplete || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: form.input,
    };

    return (
        <div className={form.field} data-half={field.half}>
            <label htmlFor={id} className={form.label}>
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
            </label>

            {field.options ? (
                // key={value}: tras guardar, React hace form.reset() y un
                // <select> vuelve a la opción que tenía al montarse (React
                // no actualiza el "selected" por defecto). Al cambiar el
                // valor guardado, la key cambia y el select se crea de
                // nuevo, ya con la opción nueva como la de por defecto.
                <select key={value} {...common}>
                    <option value="">Elige…</option>
                    {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : field.type === "textarea" ? (
                <textarea {...common} placeholder={field.placeholder} rows={3} />
            ) : (
                <input {...common} type={field.type} placeholder={field.placeholder} />
            )}

            {field.help && (
                <p id={helpId} className={form.fieldHelp}>
                    {field.help}
                </p>
            )}

            {error && (
                <p id={errorId} className={form.fieldError}>
                    {error}
                </p>
            )}
        </div>
    );
}

// useFormStatus solo funciona DENTRO del <form>: por eso el botón es
// su propio componente. `pending` es true mientras la acción se ejecuta.
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button type="submit" className={form.submit} disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
        </button>
    );
}
