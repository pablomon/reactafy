import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Shop from './pages/Shop'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'

function App() {
  return (
    // La cabecera y el pie viven fuera de <Routes>: así no se
    // desmontan al cambiar de página y React reutiliza sus nodos.
    <>
      <SiteHeader />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tienda" element={<Shop />} />
      </Routes>

      <SiteFooter />
    </>
  )
}

export default App
