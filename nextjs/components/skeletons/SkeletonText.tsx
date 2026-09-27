import styles from "./Skeleton.module.css";

// Una línea de texto gris. Se mete dentro de la etiqueta con la
// tipografía real: <p className={page.format}><SkeletonText width="10em" /></p>
export default function SkeletonText({ width }: { width: string }) {
    return <span className={`${styles.block} ${styles.text}`} style={{ width }} />;
}
