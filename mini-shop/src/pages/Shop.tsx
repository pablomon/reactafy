import { Link, useSearchParams } from 'react-router'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { ProductGrid } from '../components/ProductGrid'

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category')
  const page = Number(searchParams.get('page')) || 1

  const state = useProducts(category, page)
  const categoriesState = useCategories()

  if (state.status === 'loading') {
    return <p>Cargando productos...</p>
  }

  if (state.status === 'error') {
    return <p>{state.message}</p>
  }

  return (
    <>
      <h1>Tienda</h1>

      {categoriesState.status === 'success' && (
        <select
          value={category ?? ''}
          onChange={(event) => {
            const value = event.target.value

            setSearchParams(
              value
                ? { category: value, page: '1' }
                : { page: '1' },
            )
          }}
        >
          <option value="">Todas</option>

          {categoriesState.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      )}

      <ProductGrid products={state.products} />

      <div>
        <button
          onClick={() => {
            setSearchParams({
              ...(category ? { category } : {}),
              page: String(page - 1),
            })
          }}
          disabled={page === 1}
        >
          Anterior
        </button>

        <span>
          Página {page} de {state.totalPages}
        </span>

        <button
          onClick={() => {
            setSearchParams({
              ...(category ? { category } : {}),
              page: String(page + 1),
            })
          }}
          disabled={page === state.totalPages}
        >
          Siguiente
        </button>
      </div>

      <Link to="/">
        Volver a Home
      </Link>
    </>
  )
}

export default Shop