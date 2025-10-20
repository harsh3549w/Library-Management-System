import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { createPortal } from 'react-dom'
import { Menu, Search, User, LogOut, ChevronDown } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'

const Header = ({ onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      calculateDropdownPosition()
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])

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
  const handleLogout = async () => {
    try {
      // Try to logout from server
      await dispatch(logout()).unwrap()
    } catch (error) {
      console.error('Server logout failed:', error)
    } finally {
      // Always clear local state and storage
      dispatch({ type: 'auth/logout/fulfilled' })
      localStorage.clear()
      sessionStorage.clear()
      navigate('/login')
      setIsProfileDropdownOpen(false)
    }
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
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => {
              setIsProfileDropdownOpen(!isProfileDropdownOpen)
            }}
            className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/50 shadow-sm hover:bg-white/80 transition-colors"
          >
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium text-sm">
              {user?.name || user?.email || 'User'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Dropdown Menu - Rendered as Portal */}
        {isProfileDropdownOpen && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[99999]"
            style={{ 
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              zIndex: 99999
            }}
          >
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleProfileClick()
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <User className="h-4 w-4" />
              Profile
            </div>
            <div
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleLogout()
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </div>
          </div>,
          document.body
        )}
      </div>
    </header>
  )
}

export default Header