import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import type { Product } from '../types/product'

type ProductsState =
  | { status: 'loading' }
  | {
      status: 'success'
      products: Product[]
      total: number
      totalPages: number
    }
  | { status: 'error'; message: string }

export function useProducts(
  category: string | null,
  page: number
) {
  const [state, setState] = useState<ProductsState>({
    status: 'loading',
  })

  useEffect(() => {
    async function loadProducts() {
      try {
        setState({
          status: 'loading',
        })

        const result = await getProducts({
          page,
          limit: 10,
          category: category ?? undefined,
        })

        setState({
          status: 'success',
          products: result.products,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        })
      } catch {
        setState({
          status: 'error',
          message: 'Error cargando los productos',
        })
      }
    }

    loadProducts()
  }, [page, category])

  return state
}