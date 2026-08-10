import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Shop from './pages/Shop'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tienda" element={<Shop />} />
    </Routes>
  )
}

export default App