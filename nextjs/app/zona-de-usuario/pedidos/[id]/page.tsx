import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import OrderStatus from "@/components/account/OrderStatus";
import { getMyOrder } from "@/services/accountService";
import { getStore } from "@/services/storeService";
import { formatDate } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatPrice";
import { moneyToNumber } from "@/utils/money";
import styles from "../../account.module.css";
import { loginUrl } from "@/services/loginRedirect";

type OrderPageProps = {
    params: Promise<{ id: string }>;
};

// Detalle de un pedido. Si no existe o es de otra persona, 404
// (el plugin comprueba que el pedido sea del usuario del token).
export default async function OrderPage({ params }: OrderPageProps) {
    const id = Number((await params).id);

    if (!Number.isInteger(id) || id <= 0) {
        notFound();
    }

    const [result, store] = await Promise.all([getMyOrder(id), getStore()]);

    if (!result.ok) {
        if (result.reason === "not-found") notFound();
        redirect(await loginUrl());
    }

    const order = result.data;
    const hasDiscount = moneyToNumber(order.discount) > 0;
    const freeShipping = moneyToNumber(order.shipping) === 0;

    return (
        <>
            <Link href="/zona-de-usuario/pedidos/" className={styles.backLink}>
                ← Todos los pedidos
            </Link>

            <div className={styles.orderHeader}>
                <h1 className={styles.title}>Pedido #{order.number}</h1>
                <OrderStatus status={order.status} label={order.statusLabel} />
            </div>
            <p className={styles.muted}>{formatDate(order.date, store.timezone, true)}</p>

            <section className={styles.card}>
                <h2 className={styles.cardTitle}>Productos</h2>

                <ul className={styles.itemList}>
                    {order.items.map((item, index) => (
                        <li key={`${item.id}-${index}`} className={styles.item}>
                            {item.image ? (
                                <Image src={item.image} alt="" width={56} height={56} className={styles.itemImage} />
                            ) : (
                                <span className={styles.itemImage} />
                            )}
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.muted}>× {item.quantity}</span>
                            <span className={styles.itemTotal}>{formatPrice(item.total)}</span>
                        </li>
                    ))}
                </ul>

                <dl className={styles.totals}>
                    <div>
                        <dt>Subtotal</dt>
                        <dd>{formatPrice(order.subtotal)}</dd>
                    </div>
                    {hasDiscount && (
                        <div>
                            <dt>Descuento</dt>
                            <dd>−{formatPrice(order.discount)}</dd>
                        </div>
                    )}
                    <div>
                        <dt>Envío</dt>
                        <dd>{freeShipping ? "Gratis" : formatPrice(order.shipping)}</dd>
                    </div>
                    <div className={styles.grandTotal}>
                        <dt>Total</dt>
                        <dd>{formatPrice(order.total)}</dd>
                    </div>
                </dl>

                {order.paymentMethod && (
                    <p className={styles.muted}>Pago: {order.paymentMethod}</p>
                )}
            </section>

            <div className={styles.addresses}>
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Dirección de envío</h2>
                    <address className={styles.address}>
                        {order.shippingAddress.length > 0
                            ? order.shippingAddress.map((line, i) => <span key={i}>{line}</span>)
                            : <span className={styles.muted}>Sin dirección de envío</span>}
                    </address>
                </section>

                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Datos de facturación</h2>
                    <address className={styles.address}>
                        {order.billingAddress.length > 0
                            ? order.billingAddress.map((line, i) => <span key={i}>{line}</span>)
                            : <span className={styles.muted}>Sin datos de facturación</span>}
                    </address>
                </section>
            </div>
        </>
    );
}
