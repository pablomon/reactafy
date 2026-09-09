import { useSearchParams } from 'react-router'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import {
  ProductGrid,
  ProductGridSkeleton,
} from '../components/ProductGrid'
import { ShopToolbar } from '../components/ShopToolbar'
import {
  Pagination,
  PaginationSkeleton,
} from '../components/Pagination'

// Sale de VITE_PRODUCTS_PER_PAGE porque el <link rel="preload"> de
// index.html se construye con esa misma variable. Si el número se
// escribiera aquí a mano, cambiarlo rompería la coincidencia con el
// preload sin dar ningún error: el navegador descargaría dos veces.
const PRODUCTS_PER_PAGE =
  Number(import.meta.env.VITE_PRODUCTS_PER_PAGE) || 20;

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category')
  const page = Number(searchParams.get('page')) || 1

  const state = useProducts(category, page, PRODUCTS_PER_PAGE)
  const categoriesState = useCategories()

  function goTo(nextCategory: string | null, nextPage: number) {
    setSearchParams({
      ...(nextCategory ? { category: nextCategory } : {}),
      page: String(nextPage),
    })
  }

  return (
    <main>
      {/* Aguafy no muestra título en la tienda, pero la página
          necesita un h1 para lectores de pantalla y para SEO.
          `sr-only` lo saca de la vista sin sacarlo del documento:
          `display: none` lo escondería también de los lectores. */}
      <h1 className="sr-only">Tienda</h1>

      {/* La barra se pinta siempre, también mientras cargan los
          productos: si desapareciera, la página daría un salto en
          cada cambio de página. */}
      <ShopToolbar
        categories={
          categoriesState.status === 'success'
            ? categoriesState.categories
            : []
        }
        selected={category}
        onSelect={(nextCategory) => goTo(nextCategory, 1)}
      />

      {/* El esqueleto ocupa el mismo espacio que la rejilla real.
          Con un simple "Cargando..." la página medía una línea de
          alto y el pie saltaba miles de píxeles al llegar los datos:
          eso era el CLS. */}
      {state.status === 'loading' && (
        <>
          <p className="sr-only" role="status">
            Cargando productos
          </p>

          <ProductGridSkeleton count={PRODUCTS_PER_PAGE} />
          <PaginationSkeleton />
        </>
      )}

      {state.status === 'error' && (
        <p>{state.message}</p>
      )}

      {/* Al cambiar de página la rejilla NO se sustituye por el
          esqueleto: los productos anteriores siguen visibles, solo
          atenuados, hasta que llegan los nuevos. Es lo que hace el
          navegador al navegar entre páginas de WordPress, y por eso
          aquello se siente instantáneo. */}
      {state.status === 'success' && (
        <>
          <ProductGrid
            products={state.products}
            isFetching={state.isFetching}
          />

          <Pagination
            page={page}
            totalPages={state.totalPages}
            onChange={(nextPage) => goTo(category, nextPage)}
          />
        </>
      )}
    </main>
  )
}

export default Shop
