import { Routes, Route } from 'react-router-dom'
import HelloWorld from './HelloWorld'
import Home from './Home'
import Applications from './Applications'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hello-world" element={<HelloWorld />} />
            <Route path="/applications" element={<Applications />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
