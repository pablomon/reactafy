"use client";

import { useState } from "react";

import { siteConfig } from "@/config/site";
import styles from "./CheckoutButton.module.css";

const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

type CheckoutButtonProps = {
    // Desactivado por debajo del mínimo o con el carrito vacío. Solo es
    // una ayuda visual: quien debe impedir el pedido es WooCommerce.
    disabled?: boolean;
    // Hay cambios del carrito sin confirmar: esperar antes de ir al pago.
    syncing?: boolean;
};

export default function CheckoutButton(props: CheckoutButtonProps) {
    const [redirecting, setRedirecting] = useState(false);

    async function handleCheckout() {
        setRedirecting(true);

        const response = await fetch("/api/checkout", { method: "POST" });

        if (!response.ok) {
            console.error("Checkout failed");
            setRedirecting(false);
            return;
        }

        const data = await response.json();

        if (data.code) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `${WORDPRESS_URL}/wp-json/reactafy/v1/checkout-session`;

            const codeInput = document.createElement("input");
            codeInput.type = "hidden";
            codeInput.name = "code";
            codeInput.value = data.code;

            form.appendChild(codeInput);
            document.body.appendChild(form);
            form.submit();
            return;
        }

        window.location.href = data.checkoutUrl;
    }

    const label = redirecting
        ? "Redirigiendo…"
        : props.syncing
            ? "Actualizando…"
            : "Finalizar compra";

    return (
        <button
            type="button"
            className={styles.button}
            onClick={handleCheckout}
            disabled={props.disabled || redirecting}
        >
            {label}
        </button>
    );
}
