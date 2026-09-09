import type {
  Product,
  ProductsResponse,
} from '../types/product'
import { API_BASE } from './apiBase'

const API_URL =
  `${API_BASE}/wp-json/reactafy/v1/products`
const AUTH_TOKEN_KEY = 'reactafy.authToken'

function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY)

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

type GetProductsParams = {
  page: number
  limit: number
  category?: string
  /** Permite a quien llama cancelar la petición si deja de interesarle. */
  signal?: AbortSignal
}

export async function getProduct(
  id: string
): Promise<Product> {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error(
      'Error fetching product'
    )
  }

  const data: Product =
    await response.json()

  return data
}

export async function getProducts({
  page,
  limit,
  category,
  signal,
}: GetProductsParams): Promise<ProductsResponse> {

  const params = new URLSearchParams({
    page: String(page),
    perPage: String(limit),
  })

  if (category) {
    params.set(
      'category',
      category
    )
  }

  const response = await fetch(
    `${API_URL}?${params}`,
    {
      headers: getAuthHeaders(),
      // Debe coincidir con el `crossorigin` del <link rel="preload">
      // de index.html, que equivale a credentials: 'omit'. Si no
      // coinciden, el navegador no reutiliza la respuesta precargada
      // y descarga dos veces sin avisar de nada.
      credentials: 'omit',
      signal,
    }
  )

  if (!response.ok) {
    throw new Error(
      'Error fetching products'
    )
  }

  const data: ProductsResponse =
    await response.json()

  return data
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(
    `${API_BASE}/wp-json/wc/store/v1/products/categories`
  )

  if (!response.ok) {
    throw new Error(
      'Error fetching categories'
    )
  }

  const data = await response.json()

  return data.map(
    (category: { slug: string }) =>
      category.slug
  )
}
