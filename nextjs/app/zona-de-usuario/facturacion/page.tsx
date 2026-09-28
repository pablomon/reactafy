import { redirect } from "next/navigation";

import AddressForm from "@/components/account/AddressForm";
import { getMyAddresses } from "@/services/accountService";
import styles from "../account.module.css";
import { loginUrl } from "@/services/loginRedirect";

// Datos de facturación: la dirección "billing" de Woo más los campos
// que el checkout añade (razón social, RFC, uso CFDI). WordPress los
// manda todos juntos en el mismo bloque, así que el formulario no
// distingue unos de otros.
export default async function BillingPage() {
    const result = await getMyAddresses();

    if (!result.ok) {
        redirect(await loginUrl());
    }

    return (
        <>
            <h1 className={styles.title}>Facturación</h1>
            <p className={styles.muted}>
                Se usan para tus pedidos y facturas. Puedes cambiarlos también al pagar.
            </p>

            <AddressForm type="billing" block={result.data.billing} />
        </>
    );
}
