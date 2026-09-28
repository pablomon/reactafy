import { redirect } from "next/navigation";

import AddressForm from "@/components/account/AddressForm";
import { getMyAddresses } from "@/services/accountService";
import styles from "../account.module.css";
import { loginUrl } from "@/services/loginRedirect";

// Dirección de entrega (la "shipping" de Woo). Es la misma que sale
// rellenada en el checkout.
export default async function DeliveryPage() {
    const result = await getMyAddresses();

    if (!result.ok) {
        redirect(await loginUrl());
    }

    const { shipping } = result.data;

    return (
        <>
            <h1 className={styles.title}>Entrega</h1>

            {shipping ? (
                <>
                    <p className={styles.muted}>
                        Dónde te llevamos los pedidos. Puedes cambiarla también al pagar.
                    </p>
                    <AddressForm type="shipping" block={shipping} />
                </>
            ) : (
                // La tienda envía siempre a la dirección de facturación
                <p className={styles.muted}>
                    Los pedidos se entregan en la dirección de tus datos de facturación.
                </p>
            )}
        </>
    );
}
