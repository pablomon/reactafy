import Link from "next/link";
import { cookies } from "next/headers";

import { getOrder } from "@/services/orderService";
import { formatPrice } from "@/utils/formatPrice";

import styles from "./page.module.css";

type OrderPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        total?: string;
        tax?: string;
        items?: string;
        currency?: string;
    }>;
};

export default async function OrderPage(
    props: OrderPageProps
) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const cookieStore = await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    if (!authToken) {
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

    const order = await getOrder(
        params.id,
        authToken
    );

    return (
        <main className={styles.container}>

            <section className={styles.header}>
                <h1 className={styles.title}>
                    Pedido completado
                </h1>

                <p className={styles.orderNumber}>
                    Pedido #{order.id}
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
                                {formatPrice(
                                    item.total,
                                    order.currency,
                                    2
                                )}
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
                            {formatPrice(
                                order.tax,
                                order.currency,
                                2
                            )}
                        </span>
                    </div>

                    <div className={styles.total}>
                        <span>
                            Total
                        </span>

                        <strong>
                            {formatPrice(
                                order.total,
                                order.currency,
                                2
                            )}
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