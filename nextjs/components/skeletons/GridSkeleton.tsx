import gridStyles from "@/components/ProductGrid.module.css";
import SkeletonCards from "./SkeletonCards";
import styles from "./Skeleton.module.css";

// Tarjetas vacías mientras llega un listado (tienda, categoría, marca).
// Usa la misma clase .grid que ProductGrid: mismas columnas en cada
// pantalla, así nada "salta" cuando llegan los productos.
export default function GridSkeleton({ cards = 10 }: { cards?: number }) {
    return (
        <div aria-busy="true">
            <span className={styles.srOnly}>Cargando productos…</span>

            <div className={`${styles.block} ${styles.title}`} aria-hidden="true" />

            <div className={gridStyles.grid}>
                <SkeletonCards count={cards} />
            </div>
        </div>
    );
}
