"use client";

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
                "Checkout handoff failed"
            );

            return;
        }

        const data = await response.json();

        const form =
            document.createElement("form");

        form.method = "POST";
        form.action =
            "https://staging.aguafy.com/wp-json/reactafy/v1/checkout-session";

        const codeInput =
            document.createElement("input");

        codeInput.type = "hidden";
        codeInput.name = "code";
        codeInput.value = data.code;

        form.appendChild(codeInput);

        document.body.appendChild(form);

        form.submit();
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
