"use client";

import { siteConfig } from "@/config/site";
const WORDPRESS_URL = siteConfig.WORDPRESS_URL;

export default function CheckoutButton() {

    async function handleCheckout() {

        const response = await fetch(
            "/api/checkout",
            {
                method: "POST",
            }
        );

        if (!response.ok) {
            console.error(
                "Checkout failed"
            );

            return;
        }

        const data =
            await response.json();

        if (data.code) {

            const form =
                document.createElement("form");

            form.method = "POST";

            form.action =
                `${WORDPRESS_URL}/wp-json/reactafy/v1/checkout-session`;

            const codeInput =
                document.createElement("input");

            codeInput.type = "hidden";
            codeInput.name = "code";
            codeInput.value = data.code;

            form.appendChild(codeInput);

            document.body.appendChild(form);

            form.submit();

            return;
        }

        window.location.href =
            data.checkoutUrl;
    }

    return (
        <button
            type="button"
            onClick={handleCheckout}
        >
            Continuar al pago
        </button>
    );
}