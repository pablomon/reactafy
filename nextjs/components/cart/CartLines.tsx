"use client";

import Image from "next/image";
import { useContext, useState } from "react";

import type { CartLine } from "@/types/cart";
import { CartContext } from "@/app/context/CartContext";
import { formatPrice } from "@/utils/formatPrice";
import { cartLineFormat } from "@/utils/productFormat";
import styles from "./Cart.module.css";

// "24 latas de 500 ml"; si el producto no tiene esos atributos, sus
// valores tal cual.
function describe(line: CartLine) {
    return (
        cartLineFormat(line) ||
        line.variation.map((v) => v.value).join(" · ")
    );
}

function QuantityInput(props: { line: CartLine }) {
    const { setQuantity } = useContext(CartContext);
    const { line } = props;

    // Borrador mientras se escribe; null = mostrar la cantidad real.
    const [draft, setDraft] = useState<string | null>(null);

    function commit() {
        if (draft === null) return;

        const value = Number(draft);
        setDraft(null);

        if (Number.isInteger(value) && value >= 0 && value !== line.quantity) {
            setQuantity(line.key, value); // 0 elimina la línea
        }
    }

    return (
        <input
            className={styles.qtyInput}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            aria-label={`Cantidad de ${line.name}`}
            value={draft ?? line.quantity}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
            }}
        />
    );
}

export default function CartLines() {
    const { cart, changeQuantity, removeItem } = useContext(CartContext);

    if (!cart) return null;

    return (
        <ul className={styles.lines}>
            {cart.items.map((line) => (
                <li key={line.key} className={styles.line}>
                    <div className={styles.lineImage}>
                        {line.images[0] && (
                            <Image
                                src={line.images[0].thumbnail}
                                alt=""
                                width={128}
                                height={128}
                            />
                        )}
                    </div>

                    <div className={styles.lineInfo}>
                        <p className={styles.lineName}>{line.name}</p>
                        <p className={styles.lineMeta}>{describe(line)}</p>
                        <p className={styles.linePrice}>
                            {formatPrice(line.prices.price)}
                        </p>

                        <div className={styles.lineActions}>
                            <div className={styles.qty}>
                                <button
                                    type="button"
                                    className={styles.qtyButton}
                                    aria-label={`Quitar una unidad de ${line.name}`}
                                    onClick={() => changeQuantity(line.key, -1)}
                                >
                                    −
                                </button>

                                <QuantityInput line={line} />

                                <button
                                    type="button"
                                    className={styles.qtyButton}
                                    aria-label={`Añadir una unidad de ${line.name}`}
                                    onClick={() => changeQuantity(line.key, 1)}
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                className={styles.remove}
                                onClick={() => removeItem(line.key).catch(() => { })}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
