import { useEffect, useState } from 'react'
import { getProduct } from '../services/productService'
import type { Product } from '../types/product'

type ProductState =
  { status: 'loading' }
  | { status: 'success'; product: Product }
  | { status: 'error'; message: string }

export function useProduct(id: string | undefined) {
  const [state, setState] = useState<ProductState>({
    status: 'loading',
  })

  useEffect(() => {
    if (!id) {
      return
    }

    async function loadProduct(productId: string) {
      try {
        setState({ status: 'loading' })

        const data = await getProduct(productId)

        setState({
          status: 'success',
          product: data,
        })
      } catch {
        setState({
          status: 'error',
          message: 'Error cargando el producto',
        })
      }
    }

    loadProduct(id)
  }, [id])

  return state
}