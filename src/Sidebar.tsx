import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-100 w-64 h-full p-4">
      <ul className="space-y-2">
        <li>
          <Link to="/" className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/applications" className="block py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
            Applications
          </Link>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar