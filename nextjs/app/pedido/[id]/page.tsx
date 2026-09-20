import Link from "next/link";
import { cookies } from "next/headers";

import type { Order } from "@/types/order";
import { getOrder } from "@/services/orderService";
import { formatPrice } from "@/utils/formatPrice";
import { formatOrderStatus } from "@/utils/formatOrderStatus";

import styles from "./page.module.css";
import CartRefresh from "./CaretRefresh";

type OrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

// Se pinta cuando no se puede mostrar el pedido, sea cual sea el
// motivo. Dice lo mismo en todos los casos a propósito: si el aviso
// cambiara según el pedido exista o no, sería una forma de averiguar
// qué pedidos hay en la tienda.
function OrderUnavailable() {
    return (
        <main className={styles.container}>
            <h1>Pedido no disponible</h1>

            <p>
                No se ha podido verificar tu pedido.
            </p>

            <Link href="/tienda">
                Volver a la tienda
            </Link>
        </main>
    );
}

export default async function OrderPage(
    props: OrderPageProps
) {
    const params = await props.params;

    // El id llega de la URL y acaba en la ruta que se pide a
    // WordPress.
    if (!/^\d+$/.test(params.id)) {
        return <OrderUnavailable />;
    }

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    if (!authToken) {
        return <OrderUnavailable />;
    }

    // getOrder lanza si WordPress responde con error: pedido
    // inexistente, pedido de otro cliente o la tienda caída. Sin
    // este try, el cliente vería la pantalla de error de Next justo
    // después de pagar.
    let order: Order;

    try {
        order = await getOrder(
            params.id,
            authToken
        );
    } catch (error) {
        console.error(
            `pedido ${params.id}: no se ha podido cargar`,
            error
        );

        return <OrderUnavailable />;
    }

    return (
        <main className={styles.container}>

            <CartRefresh />
            <section className={styles.header}>
                <h1 className={styles.title}>
                    Pedido completado
                </h1>

                <p>
                    Pedido #{order.id}
                </p>

                <p>
                    Estado: {formatOrderStatus(order.status)}
                </p>

                <p>
                    Gracias por tu compra.
                </p>
            </section>

            <div className={styles.content}>

                <section className={styles.items}>

                    <h2>
                        Productos
                    </h2>

                    {order.items.map((item) => (
                        <article
                            key={item.id}
                            className={styles.item}
                        >

                            {item.image && (
                                <img
                                    className={styles.image}
                                    src={item.image}
                                    alt={item.name}
                                    width={100}
                                    height={100}
                                />
                            )}

                            <div className={styles.itemInfo}>

                                <h3>
                                    {item.name}
                                </h3>

                                <p>
                                    Cantidad: {item.quantity}
                                </p>

                            </div>

                            <p className={styles.itemTotal}>
                                {formatPrice(item.total)}
                            </p>

                        </article>
                    ))}

                </section>

                <aside className={styles.summary}>

                    <h2>
                        Resumen
                    </h2>

                    <div className={styles.summaryRow}>
                        <span>
                            Artículos
                        </span>

                        <span>
                            {order.items.reduce(
                                (total, item) =>
                                    total + item.quantity,
                                0
                            )}
                        </span>
                    </div>

                    <div className={styles.summaryRow}>
                        <span>
                            IVA
                        </span>

                        <span>
                            {formatPrice(order.tax)}
                        </span>
                    </div>

                    <div className={styles.total}>
                        <span>
                            Total
                        </span>

                        <strong>
                            {formatPrice(order.total)}
                        </strong>
                    </div>

                </aside>

            </div>

            <div className={styles.actions}>

                <Link
                    href="/tienda"
                    className={styles.button}
                >
                    Volver a la tienda
                </Link>

            </div>

        </main>
    );
}