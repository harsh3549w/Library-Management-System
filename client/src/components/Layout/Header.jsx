import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, Search, User, LogOut, ChevronDown } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'

const Header = ({ onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // Handle logout
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    setIsProfileDropdownOpen(false)
  }

  // Handle profile navigation
  const handleProfileClick = () => {
    navigate('/profile')
    setIsProfileDropdownOpen(false)
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

        {/* Right side - User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/50 shadow-sm hover:bg-white/80 transition-colors"
          >
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium text-sm">
              {user?.name || user?.email || 'User'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header