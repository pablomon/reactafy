import type { Money } from "@/types/money";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./Product.module.css";

type ProductNotesProps = {
    // Etiqueta "alcohol" del producto en Woo
    isAlcohol: boolean;
    // Pedido mínimo de la tienda (Ajustes → Tienda en Woo)
    minOrder: Money;
};

// Avisos bajo el botón de compra. Server Component.
export default function ProductNotes({ isAlcohol, minOrder }: ProductNotesProps) {
    return (
        <ul className={styles.notes}>
            {isAlcohol && (
                <li className={styles.note}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M12 3 2 21h20L12 3Z" strokeLinejoin="round" />
                        <path d="M12 10v5M12 18h.01" strokeLinecap="round" />
                    </svg>
                    <strong>Venta de bebidas alcohólicas prohibida a menores de edad.</strong>
                </li>
            )}

            <li className={styles.note}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" strokeLinejoin="round" />
                    <path d="m3 7.5 9 4.5 9-4.5M12 12v9" strokeLinejoin="round" />
                </svg>
                <span>
                    <strong>Pedido mínimo</strong>
                    <br />
                    Disfruta el envío gratis a partir de un pedido mínimo de{" "}
                    {formatPrice(minOrder)} en todos los artículos en stock.
                </span>
            </li>
        </ul>
    );
}
