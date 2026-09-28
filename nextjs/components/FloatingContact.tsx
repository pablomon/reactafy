import Image from "next/image";

import type { Store } from "@/types/store";
import styles from "./FloatingContact.module.css";

// Botones flotantes de WhatsApp y llamar, abajo a la derecha en todas
// las páginas (como en aguafy.com). Server Component: son dos enlaces,
// no necesitan JavaScript en el navegador. Los números salen de
// Ajustes → Tienda en WordPress (/store).
export default function FloatingContact({ store }: { store: Store }) {
    const { whatsappUrl, phone, callingCode } = store;

    if (!whatsappUrl && !phone) {
        return null;
    }

    return (
        <div className={styles.floating}>
            {whatsappUrl && (
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contactar por WhatsApp"
                    className={styles.button}
                >
                    {/* SVG estático: se sirve tal cual (unoptimized) */}
                    <Image src="/icons/whatsapp.svg" alt="" width={60} height={60} unoptimized />
                </a>
            )}

            {phone && (
                <a
                    href={`tel:${callingCode}${phone}`}
                    aria-label="Llamar por teléfono"
                    className={`${styles.button} ${styles.phone}`}
                >
                    <Image src="/icons/phone.svg" alt="" width={60} height={60} unoptimized />
                </a>
            )}
        </div>
    );
}
