import Link from "next/link";
import { redirect } from "next/navigation";

import OrderStatus from "@/components/account/OrderStatus";
import { getMyOrders } from "@/services/accountService";
import { getStore } from "@/services/storeService";
import { formatDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import styles from "./account.module.css";
import { loginUrl } from "@/services/loginRedirect";

// Resumen: el último pedido y accesos a cada sección.
export default async function AccountHomePage() {
    const [orders, store] = await Promise.all([getMyOrders(1, 1), getStore()]);

    if (!orders.ok) {
        redirect(await loginUrl());
    }

    const last = orders.data.orders[0];

    return (
        <>
            <h1 className={styles.title}>Mi cuenta</h1>

            <section className={styles.card}>
                <h2 className={styles.cardTitle}>Último pedido</h2>

                {last ? (
                    <Link href={`/zona-de-usuario/pedidos/${last.id}/`} className={styles.lastOrder}>
                        <span className={styles.orderNumber}>Pedido #{last.number}</span>
                        <span className={styles.muted}>{formatDate(last.date, store.timezone)}</span>
                        <OrderStatus status={last.status} label={last.statusLabel} />
                        <span className={styles.orderTotal}>{formatPrice(last.total)}</span>
                    </Link>
                ) : (
                    <p className={styles.muted}>
                        Todavía no has hecho ningún pedido. <Link href="/tienda/">Ir a la tienda</Link>
                    </p>
                )}

                {orders.data.pagination.total > 1 && (
                    <Link href="/zona-de-usuario/pedidos/" className={styles.moreLink}>
                        Ver todos los pedidos ({orders.data.pagination.total})
                    </Link>
                )}
            </section>
        </>
    );
}
