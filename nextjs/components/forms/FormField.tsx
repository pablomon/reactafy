"use client";

import { useId, type InputHTMLAttributes } from "react";

import form from "./Form.module.css";

type FormFieldProps = {
    label: string;
    name: string;
    error?: string;
    help?: string;
    half?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id" | "className">;

// Un campo de texto con su etiqueta, ayuda y error, con los estilos
// comunes. El resto de props (type, defaultValue, autoComplete,
// required…) van tal cual al <input>.
export default function FormField({ label, name, error, help, half, ...input }: FormFieldProps) {
    const id = useId();
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;

    // Los lectores de pantalla leen ayuda y error al entrar en el campo
    const describedBy = [help && helpId, error && errorId].filter(Boolean).join(" ") || undefined;

    return (
        <div className={form.field} data-half={half}>
            <label htmlFor={id} className={form.label}>
                {label}
            </label>

            <input
                {...input}
                id={id}
                name={name}
                className={form.input}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
            />

            {help && (
                <p id={helpId} className={form.fieldHelp}>
                    {help}
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
