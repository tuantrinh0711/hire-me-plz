import { Routes, Route } from 'react-router-dom'
import HelloWorld from './HelloWorld'
import Home from './Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hello-world" element={<HelloWorld />} />
    </Routes>
  )
}

export default App
