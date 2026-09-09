import type { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: Product[];
  /** true mientras se piden los de otra página. */
  isFetching?: boolean;
}

export function ProductGrid({
  products,
  isFetching = false,
}: ProductGridProps) {
  return (
    <section
      className={
        isFetching ? `${styles.grid} ${styles.fetching}` : styles.grid
      }
      aria-busy={isFetching}
    >
      {/* El índice se pasa solo para decidir la prioridad de carga
          de la imagen, no para identificar la tarjeta: la identidad
          la da `key={product.id}`. */}
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
        />
      ))}
    </section>
  );
}

interface ProductGridSkeletonProps {
  /** Debe coincidir con PRODUCTS_PER_PAGE, o la altura no cuadra. */
  count: number;
}

/**
 * Misma rejilla, mismas dimensiones, sin datos. Comparte el módulo
 * CSS con ProductGrid para que las columnas y separaciones sean
 * idénticas y el cambio de esqueleto a contenido no mueva nada.
 */
export function ProductGridSkeleton({
  count,
}: ProductGridSkeletonProps) {
  return (
    <section className={styles.grid}>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </section>
  );
}
