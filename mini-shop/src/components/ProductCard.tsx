import type { Product } from '../types/product'
import { getProductAttribute } from '../utils/productAttributes'
import { formatPrice } from '../utils/formatPrice'
import {
  getImageSources,
  PRODUCT_IMAGE_SIZES,
} from '../utils/productImage'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
  /** Posición en la rejilla. Solo decide la prioridad de la imagen. */
  index?: number
}

/** Cuántas tarjetas se consideran visibles sin hacer scroll. */
const ABOVE_THE_FOLD = 4

export function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {

  // La primera imagen es el elemento LCP de la página. Diferirla
  // retrasa a propósito la métrica que más pesa en PageSpeed.
  const isLcp = index === 0
  const isVisible = index < ABOVE_THE_FOLD

  const volume = getProductAttribute(
    product.attributes,
    'volumen'
  )

  const quantity = getProductAttribute(
    product.attributes,
    'cantidad'
  )

  // Aguafy pinta la subcategoría ("Natural"), no la raíz ("Agua").
  // Las hijas son las que tienen parentId distinto de 0.
  const category =
    product.categories.find(
      (candidate) => candidate.parentId !== 0
    ) ?? product.categories[0]

  const hasRange = product.fromPrice !== null
  const price = product.fromPrice ?? product.price

  const flags = [
    product.editorial.isNew && 'Nuevo',
    product.editorial.isFeatured && 'Destacado',
    product.editorial.isLowStock && 'Últimas unidades',
  ].filter(Boolean) as string[]

  return (
    <article className={styles.card}>

      <div className={styles.box}>
        {product.image ? (
          <img
            {...getImageSources(product.image)}
            sizes={PRODUCT_IMAGE_SIZES}
            // Si WordPress no generó alguna variante, la petición da
            // 404. Hay que vaciar el srcset además del src: mientras
            // exista, tiene prioridad sobre él.
            onError={(event) => {
              const img = event.currentTarget

              if (product.image && img.srcset) {
                img.srcset = ''
                img.src = product.image
              }
            }}
            alt={product.title}
            width={300}
            height={300}
            loading={isVisible ? 'eager' : 'lazy'}
            // Solo una imagen por página debe llevar prioridad alta:
            // marcar varias diluye la señal y no sirve de nada.
            fetchPriority={isLcp ? 'high' : 'auto'}
            decoding={isLcp ? 'sync' : 'async'}
            className={styles.image}
          />
        ) : (
          <div
            className={styles.placeholder}
            aria-hidden="true"
          />
        )}

        {flags.length > 0 && (
          <ul className={styles.flags}>
            {flags.map((flag) => (
              <li key={flag} className={styles.flag}>
                {flag}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          aria-label={`Añadir ${product.title} al carrito`}
          className={styles.add}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Todas las filas se pintan siempre, con un espacio duro
          cuando no hay dato. Si una tarjeta se saltara una línea
          sería más baja que sus vecinas y la rejilla se movería al
          cambiar de página. */}
      <div className={styles.info}>
        <p className={styles.badgeRow}>
          <span
            className={
              category
                ? styles.badge
                : `${styles.badge} ${styles.badgeEmpty}`
            }
          >
            {category ? category.name : '\u00a0'}
          </span>
        </p>

        <div className={styles.text}>
          <h2 className={styles.name}>
            {product.title}
          </h2>

          <p className={styles.meta}>
            {quantity !== undefined && volume !== undefined
              ? `${quantity} botellas de ${volume}`
              : ' '}
          </p>

          <p>
            {hasRange && 'Desde '}
            {formatPrice(price)}
          </p>

          <p className={styles.tax}>
            (IVA inc.)
          </p>

          <p className={styles.brand}>
            {product.brand
              ? <span className={styles.brandName}>{product.brand.name}</span>
              : ' '}
          </p>
        </div>
      </div>
    </article>
  )
}
