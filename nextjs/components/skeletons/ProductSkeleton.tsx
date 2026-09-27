import styles from "./Skeleton.module.css";

// Esqueleto de la ficha: imagen a la izquierda, datos a la derecha.
export default function ProductSkeleton() {
    return (
        <div aria-busy="true">
            <span className={styles.srOnly}>Cargando producto…</span>

            <div className={styles.product} aria-hidden="true">
                <div className={`${styles.block} ${styles.productImage}`} />

                <div className={styles.productInfo}>
                    <div className={`${styles.block} ${styles.productTitle}`} />
                    <div className={`${styles.block} ${styles.productLine}`} />
                    <div className={`${styles.block} ${styles.productLine}`} />
                    <div className={`${styles.block} ${styles.productButton}`} />
                </div>
            </div>
        </div>
    );
}
