import styles from './ProductCard.module.css'

/**
 * Ocupa exactamente el mismo espacio que ProductCard.
 *
 * Usa sus mismas clases (.card, .box, .info, .name, .meta...) para
 * que la altura coincida al píxel: las líneas heredan el tamaño de
 * fuente y el interlineado de la tarjeta real. Si se dibujaran
 * cajas con alturas inventadas, el salto de layout no desaparecería,
 * solo cambiaría de momento.
 *
 * `aria-hidden` porque no es contenido: el aviso de carga lo da
 * Shop con un `role="status"`.
 */
export function ProductCardSkeleton() {
  return (
    <article className={styles.card} aria-hidden="true">
      <div className={`${styles.box} ${styles.skeletonBox} ${styles.pulse}`}>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.info}>
        <p className={styles.badgeRow}>
          <span className={`${styles.badge} ${styles.pulse}`}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </p>

        <div className={styles.text}>
          <h2 className={`${styles.name} ${styles.skeletonLine} ${styles.w80} ${styles.pulse}`}>
            &nbsp;
          </h2>

          <p className={`${styles.meta} ${styles.skeletonLine} ${styles.w60} ${styles.pulse}`}>
            &nbsp;
          </p>

          <p className={`${styles.skeletonLine} ${styles.w45} ${styles.pulse}`}>
            &nbsp;
          </p>

          <p className={`${styles.tax} ${styles.skeletonLine} ${styles.w30} ${styles.pulse}`}>
            &nbsp;
          </p>

          <p className={`${styles.brand} ${styles.skeletonLine} ${styles.w45} ${styles.pulse}`}>
            &nbsp;
          </p>
        </div>
      </div>
    </article>
  )
}
