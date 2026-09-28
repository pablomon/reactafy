"use client";

import { useFormStatus } from "react-dom";

import form from "./Form.module.css";

type SubmitButtonProps = {
    children: string;       // "Guardar"
    pendingText: string;    // "Guardando…"
    wide?: boolean;         // ancho completo (login, registro…)
    // Seguir "ocupado" aunque la acción haya terminado (p. ej. mientras
    // se navega tras iniciar sesión)
    busy?: boolean;
};

// Botón de envío que se desactiva mientras la Server Action trabaja.
// useFormStatus solo funciona DENTRO del <form>: por eso es su propio
// componente.
export default function SubmitButton({ children, pendingText, wide, busy }: SubmitButtonProps) {
    const { pending: sending } = useFormStatus();
    const pending = sending || busy;

    return (
        <button
            type="submit"
            className={wide ? `${form.submit} ${form.submitWide}` : form.submit}
            disabled={pending}
        >
            {pending ? pendingText : children}
        </button>
    );
}
