import styles from "./Skeleton.module.css";

// N tarjetas vacías (imagen + 2 líneas). Sin contenedor: se meten
// directamente dentro de un .grid, sea el del esqueleto o el real.
export default function SkeletonCards({ count }: { count: number }) {
    return Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true">
            <div className={`${styles.block} ${styles.cardImage}`} />
            <div className={`${styles.block} ${styles.cardLine}`} />
            <div className={`${styles.block} ${styles.cardLine} ${styles.cardLineShort}`} />
        </div>
    ));
}
