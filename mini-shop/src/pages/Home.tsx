import { Link } from 'react-router'

function Home() {
  return (
    <main>
      <h1>Reactafy</h1>

      <Link to="/tienda">
        Ir a la tienda
      </Link>
    </main>
  )
}

export default Home