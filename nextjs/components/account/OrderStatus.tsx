import styles from "@/app/zona-de-usuario/account.module.css";

// Color de la píldora según el código de estado de Woo. El TEXTO siempre
// es el de Woo (statusLabel); aquí solo se decide el tono. Un estado que
// no esté aquí (p. ej. uno añadido por un plugin) sale en gris neutro.
const TONES: Record<string, "progress" | "done" | "problem"> = {
    pending: "progress",
    "on-hold": "progress",
    processing: "progress",
    completed: "done",
    cancelled: "problem",
    refunded: "problem",
    failed: "problem",
};

export default function OrderStatus({ status, label }: { status: string; label: string }) {
    return (
        <span className={styles.status} data-tone={TONES[status] ?? "neutral"}>
            {label}
        </span>
    );
}
