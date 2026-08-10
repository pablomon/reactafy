import { useParams } from 'react-router'
import { useProduct } from '../hooks/useProduct'

function Product() {
  const { id } = useParams<{ id: string }>()   
  const state = useProduct(id)

  if (state.status === 'loading') {
    return <p>Cargando...</p>
  }

  if (state.status === 'error') {
    return <p>{state.message}</p>
  }

  return (
    <>
      <h1>{state.product.title}</h1>
      <p>{state.product.price} €</p>
    </>
  )
}

export default Product