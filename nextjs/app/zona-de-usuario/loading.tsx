import SkeletonText from "@/components/skeletons/SkeletonText";
import skeleton from "@/components/skeletons/Skeleton.module.css";
import styles from "./account.module.css";

// Se enseña al momento al cambiar de sección dentro de la zona de
// usuario, mientras la página nueva pide sus datos a WordPress.
// Va DENTRO del layout: el menú lateral se queda quieto y solo la
// zona de contenido pasa a "cargando".
//
// Sirve para todas las secciones (resumen, pedidos, entrega,
// facturación): un loading.tsx cubre a todas las rutas que cuelgan
// de su carpeta. Es genérico a propósito: título + una tarjeta.
export default function AccountLoading() {
    return (
        <div role="status" aria-live="polite">
            <span className={skeleton.srOnly}>Cargando…</span>

            <p className={styles.title} aria-hidden="true">
                <SkeletonText width="8em" />
            </p>

            <div className={styles.card} aria-hidden="true">
                <p className={styles.cardTitle}>
                    <SkeletonText width="9em" />
                </p>
                <p className={styles.muted}>
                    <SkeletonText width="70%" />
                </p>
                <p className={styles.muted}>
                    <SkeletonText width="45%" />
                </p>
            </div>
        </div>
    );
}
