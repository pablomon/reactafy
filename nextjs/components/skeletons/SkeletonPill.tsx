import styles from "./Skeleton.module.css";

// Botón o chip gris con las medidas del real
export default function SkeletonPill({ width, height }: { width: number; height: number }) {
    return <span className={`${styles.block} ${styles.pill}`} style={{ width, height }} />;
}
