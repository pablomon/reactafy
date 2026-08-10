import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import {
  getCurrentUser,
  login,
  logout,
} from '../services/authService'

const CHECKOUT_URL =
  'https://staging.aguafy.com/finalizar-compra/'

function Home() {
  const [status, setStatus] = useState<
  'idle' | 'loading' | 'authenticated' | 'error'  
  >('idle')
  const [message, setMessage] = useState('')

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '')
    const password = String(formData.get('password') ?? '')

    try {
      const session = await login(username, password)
      const user = await getCurrentUser(session.token)

      sessionStorage.setItem('reactafy.authToken', session.token)
      setStatus('authenticated')
      setMessage(`Sesión iniciada como ${user.name}`)
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : 'Ha ocurrido un error inesperado',
      )
    }
  }

  return (
    <main>
      <h1>Reactafy</h1>

      <section>
        <h2>Prueba de autenticación</h2>

        <form onSubmit={handleLogin}>
          <label>
            Usuario
            <input name="username" required />
          </label>

          <label>
            Contraseña
            <input name="password" type="password" required />
          </label>

          <button disabled={status === 'loading'}>
            {status === 'loading'
              ? 'Iniciando sesión…'
              : 'Iniciar sesión'}
          </button>
        </form>

        {message && <p role="status">{message}</p>}

        {status === 'authenticated' && (
          <button
            type="button"
            onClick={() => {
              logout()
              setStatus('idle')
              setMessage('Sesión cerrada')
            }}
          >
            Cerrar sesión
          </button>
        )}
      </section>

      <Link to="/tienda">
        Ir a la tienda
      </Link>

      <a href={CHECKOUT_URL}>
        Ir al checkout de WooCommerce
      </a>
    </main>
  )
}

export default Home
