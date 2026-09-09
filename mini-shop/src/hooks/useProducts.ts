import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import type { Product } from '../types/product'


type ProductsState =
  // Primera carga: todavía no hay nada que enseñar.
  | { status: 'loading' }
  // Hay productos en pantalla. `isFetching` indica si además se está
  // pidiendo otra página: los datos viejos siguen siendo válidos y se
  // mantienen visibles hasta que llegan los nuevos.
  | {
      status: 'success'
      products: Product[]
      total: number
      totalPages: number
      isFetching: boolean
    }
  | { status: 'error'; message: string }

export function useProducts(
  category: string | null,
  page: number,
  perPage: number,
) {
  const [state, setState] = useState<ProductsState>({
    status: 'loading',
  })

  useEffect(() => {
    // Un controlador por ejecución del efecto. Si las dependencias
    // cambian antes de que llegue la respuesta, la limpieza lo aborta
    // y esa petición ya no puede pisar a la siguiente.
    const controller = new AbortController()

    async function loadProducts() {
      // Conservar lo anterior mientras carga lo nuevo. Sin esto, la
      // rejilla desaparece en cada clic y el usuario ve dos cambios
      // visuales en vez de uno.
      setState((previous) =>
        previous.status === 'success'
          ? { ...previous, isFetching: true }
          : { status: 'loading' },
      )

      try {
        const result = await getProducts({
          page,
          limit: perPage,
          category: category ?? undefined,
          signal: controller.signal,
        })

        setState({
          status: 'success',
          products: result.products,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
          isFetching: false,
        })
      } catch {
        // Si la petición se canceló a propósito no es un error: otra
        // más reciente viene en camino y será ella quien pinte.
        if (controller.signal.aborted) return

        setState({
          status: 'error',
          message: 'Error cargando los productos',
        })
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [page, category, perPage])

  return state
}
