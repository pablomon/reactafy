import { useEffect, useState } from 'react'
import { getCategories } from '../services/productService'

type CategoriesState =
  | { status: 'loading' }
  | { status: 'success'; categories: string[] }
  | { status: 'error'; message: string }

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({
    status: 'loading',
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        setState({ status: 'loading' })

        const categories = await getCategories()

        setState({
          status: 'success',
          categories,
        })
      } catch {
        setState({
          status: 'error',
          message: 'Error cargando las categorías',
        })
      }
    }

    loadCategories()
  }, [])

  return state
}