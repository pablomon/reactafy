"use client";

import { useContext, useState } from "react";

import { CartContext } from "@/app/context/CartContext";
import styles from "./Product.module.css";

type AddToCartFormProps = {
    productId: number;
    title: string;
    outOfStock: boolean;
};

type AddState = "idle" | "adding" | "added" | "error";

const MAX_QUANTITY = 99;

// Selector de cantidad (− 1 +) y "Añadir al carrito".
export default function AddToCartForm({ productId, title, outOfStock }: AddToCartFormProps) {
    const { addItem } = useContext(CartContext);

    // Lo que se escribe en el input (puede estar vacío mientras se teclea)
    const [draft, setDraft] = useState("1");
    const [addState, setAddState] = useState<AddState>("idle");

    // Cantidad válida derivada del borrador: entre 1 y 99
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, Number(draft) || 1));

    function change(delta: number) {
        setDraft(String(Math.min(MAX_QUANTITY, Math.max(1, quantity + delta))));
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (addState === "adding" || outOfStock) return;

        setAddState("adding");

        try {
            await addItem(productId, quantity);
            setAddState("added");
        } catch {
            setAddState("error");
        }

        setTimeout(() => setAddState("idle"), 2000);
    }

    const label = outOfStock
        ? "Agotado"
        : {
            idle: "Añadir al carrito",
            adding: "Añadiendo…",
            added: "Añadido ✓",
            error: "Error, inténtalo de nuevo",
        }[addState];

    return (
        <form className={styles.addForm} onSubmit={handleSubmit}>
            <div className={styles.quantity}>
                <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => change(-1)}
                    disabled={quantity <= 1 || outOfStock}
                    aria-label="Quitar una unidad"
                >
                    −
                </button>

                <input
                    className={styles.quantityInput}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_QUANTITY}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    // Al salir del campo, se corrige a un valor válido
                    onBlur={() => setDraft(String(quantity))}
                    disabled={outOfStock}
                    aria-label={`Cantidad de ${title}`}
                />

                <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => change(1)}
                    disabled={quantity >= MAX_QUANTITY || outOfStock}
                    aria-label="Añadir una unidad"
                >
                    +
                </button>
            </div>

            <button
                type="submit"
                className={styles.addButton}
                data-state={addState}
                disabled={outOfStock || addState === "adding"}
            >
                {label}
            </button>

            {/* Anuncia el resultado a los lectores de pantalla */}
            <span className={styles.srOnly} role="status">
                {addState === "added" ? `${title} añadido al carrito` : ""}
            </span>
        </form>
    );
}
