import form from "./Form.module.css";

type FormStatusProps = {
    state: { status: string; message?: string };
    savedText?: string;
};

// "Guardado" o el mensaje de error junto al botón. role="status": los
// lectores de pantalla lo anuncian al aparecer.
export default function FormStatus({ state, savedText = "Guardado" }: FormStatusProps) {
    return (
        <p role="status" className={form.formMessage} data-status={state.status}>
            {state.status === "saved" && savedText}
            {state.status === "error" && state.message}
        </p>
    );
}
