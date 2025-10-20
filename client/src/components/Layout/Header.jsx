import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()


  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <header className="bg-white/40 backdrop-blur-md shadow-lg border border-white/50 rounded-2xl mx-4 mt-4">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div className="relative w-[280px]">
          <form onSubmit={handleSearch} className="bg-white/60 backdrop-blur-sm h-[44px] rounded-[15px] flex items-center px-4 border border-white/50 shadow-sm">
            <Search className="size-[20px] text-gray-600" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="ml-3 bg-transparent border-none outline-none flex-1 text-sm text-gray-800 placeholder:text-gray-500"
            />
          </form>
        </div>

        {/* Navigation Links */}
        <nav className="flex gap-8">
          <Link to="/dashboard" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">Home</Link>
          <Link to="/profile" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">About Us</Link>
          <Link to="/books" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">E-books</Link>
          <Link to="/contact" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">Contact Us</Link>
        </nav>

        {/* IIITDM Logo and E-Library */}
        <div className="flex items-center gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-white/50">
            <img
              src="/images/iiitdm-logo.jpeg"
              alt="IIITDM Logo"
              className="w-[50px] h-[50px] object-cover rounded-lg"
            />
          </div>
          <span className="text-gray-800 font-medium text-lg">E-Library</span>
        </div>
      </div>
    </header>
  )
}

export default Header