import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    // `nav` con etiqueta: un lector de pantalla puede saltar aquí
    // directamente y sabe de qué navegación se trata.
    <nav
      className={styles.pagination}
      aria-label="Paginación de productos"
    >
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page - 1)}
        disabled={isFirst}
      >
        Anterior
      </button>

      {/* `aria-live` hace que el lector anuncie el cambio de página,
          que si no pasaría en silencio al ser una SPA. */}
      <span className={styles.status} aria-live="polite">
        Página {page} de {totalPages}
      </span>


      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page + 1)}
        disabled={isLast}
      >
        Siguiente
      </button>
    </nav>
  )
}

/**
 * Misma altura y mismos botones, sin saber aún cuántas páginas hay.
 * Existe solo para que el pie no se desplace cuando llegan los datos.
 */
export function PaginationSkeleton() {
  return (
    <div className={styles.pagination} aria-hidden="true">
      <button type="button" className={styles.button} disabled>
        Anterior
      </button>

      <span className={styles.status}>Página&nbsp;—</span>

      <button type="button" className={styles.button} disabled>
        Siguiente
      </button>
    </div>
  )
}
