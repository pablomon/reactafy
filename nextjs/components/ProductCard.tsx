import type { Product } from "@/types/product";
import styles from "./ProductCard.module.css";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/utils/formatPrice";

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

            <Link href={`/producto/${product.id}`}>
                <h2 className={styles.name}>
                    {product.title}
                </h2>
            </Link>

            {quantity && volume && (
                <p className={styles.meta}>
                    {quantity.value} botellas de {volume.value}
                </p>
            )}

            <p className={styles.price}>
                {product.fromPrice !== null && "Desde "}
                {formatPrice(price)} €
            </p>

            <p className={styles.tax}>
                (IVA inc.)
            </p>

            {product.brand && (
                <p className={styles.brand}>
                    {product.brand.name}
                </p>
            )}

            <AddToCartButton productId={product.id} />
        </article>
    );
}