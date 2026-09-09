import styles from './ShopToolbar.module.css'

interface ShopToolbarProps {
  categories: string[]
  selected: string | null
  onSelect: (category: string | null) => void
}

/**
 * La API devuelve slugs ("agua-natural"); aquí se convierten en
 * etiquetas legibles ("Agua natural") para el desplegable.
 */
function toLabel(slug: string): string {
  const words = slug.replace(/-/g, ' ')

  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function ShopToolbar({
  categories,
  selected,
  onSelect,
}: ShopToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.end}>
        <div className={styles.field}>
          <select
            className={styles.select}
            aria-label="Filtrar por categoría"
            value={selected ?? ''}
            onChange={(event) => {
              onSelect(event.target.value || null)
            }}
          >
            <option value="">Todas las categorías</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {toLabel(category)}
              </option>
            ))}
          </select>

          <svg
            className={styles.chevron}
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}
