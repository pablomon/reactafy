import Link from "next/link";
import { redirect } from "next/navigation";

import OrderStatus from "@/components/account/OrderStatus";
import { getMyOrders } from "@/services/accountService";
import { getStore } from "@/services/storeService";
import { formatDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import styles from "../account.module.css";
import { loginUrl } from "@/services/loginRedirect";

type OrdersPageProps = {
    searchParams: Promise<{ page?: string }>;
};

// Listado de pedidos. Paginación por URL (?page=2): se puede
// compartir, recargar y usar "atrás", como en la tienda.
export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const page = Math.max(1, Number((await searchParams).page) || 1);

    const [result, store] = await Promise.all([getMyOrders(page), getStore()]);

    if (!result.ok) {
        redirect(await loginUrl());
    }

    const { orders, pagination } = result.data;

    return (
        <>
            <h1 className={styles.title}>Pedidos</h1>

            {orders.length === 0 ? (
                <p className={styles.muted}>
                    Todavía no has hecho ningún pedido. <Link href="/tienda/">Ir a la tienda</Link>
                </p>
            ) : (
                <ul className={styles.orderList}>
                    {orders.map((order) => (
                        <li key={order.id}>
                            <Link href={`/zona-de-usuario/pedidos/${order.id}/`} className={styles.orderRow}>
                                <span className={styles.orderNumber}>#{order.number}</span>
                                <span className={styles.muted}>{formatDate(order.date, store.timezone)}</span>
                                <OrderStatus status={order.status} label={order.statusLabel} />
                                <span className={styles.muted}>
                                    {order.itemCount} {order.itemCount === 1 ? "artículo" : "artículos"}
                                </span>
                                <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {pagination.totalPages > 1 && (
                <nav className={styles.pager} aria-label="Páginas de pedidos">
                    {page > 1 ? (
                        <Link href={`?page=${page - 1}`}>← Más recientes</Link>
                    ) : (
                        <span />
                    )}
                    <span className={styles.muted}>
                        Página {page} de {pagination.totalPages}
                    </span>
                    {page < pagination.totalPages ? (
                        <Link href={`?page=${page + 1}`}>Anteriores →</Link>
                    ) : (
                        <span />
                    )}
                </nav>
            )}
        </>
    );
}
