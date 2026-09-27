"use client";

import { useLinkStatus } from "next/link";

import styles from "./Product.module.css";

// Va DENTRO de un <Link>. useLinkStatus() dice si la navegación de ese
// enlace concreto está en curso. Es un componente cliente pequeñito para que
// ProductSelectors pueda seguir siendo Server Component.
// El CSS usa :has([data-pending="true"]) para que el propio chip parpadee.
export default function OptionPending() {
    const { pending } = useLinkStatus();

    return <span className={styles.optionPending} data-pending={pending} aria-hidden="true" />;
}
