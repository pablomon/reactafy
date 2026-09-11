import type { Product } from "@/types/product";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const volume = product.attributes.find(
        (attribute) => attribute.slug === "volumen"
    );

    const quantity = product.attributes.find(
        (attribute) => attribute.slug === "cantidad"
    );

    const category =
        product.categories.find(
            (category) => category.parentId !== 0
        ) ?? product.categories[0];

    const price = product.fromPrice ?? product.price;

    return (
        <article className={styles.card}>
            <div className={styles.imageBox}>
                {product.image ? (
                    <img
                        className={styles.image}
                        src={product.image}
                        alt={product.title}
                        width={300}
                        height={300}
                    />
                ) : (
                    <div />
                )}
            </div>

            {category && (
                <span className={styles.category}>
                    {category.name}
                </span>
            )}

            <h2 className={styles.name}>
                {product.title}
            </h2>

            {quantity && volume && (
                <p className={styles.meta}>
                    {quantity.value} botellas de {volume.value}
                </p>
            )}

            <p className={styles.price}>
                {product.fromPrice !== null && "Desde "}
                {price} €
            </p>

            <p className={styles.tax}>
                (IVA inc.)
            </p>

            {product.brand && (
                <p className={styles.brand}>
                    {product.brand.name}
                </p>
            )}

            <button type="button">
                Añadir al carrito
            </button>
        </article>
    );
}