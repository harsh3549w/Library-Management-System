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
    <header className="bg-white/40 backdrop-blur-md shadow-lg border border-white/70 rounded-2xl mx-2 sm:mx-4 mt-4 sticky top-4 z-50">
      <div className="flex items-center justify-between px-2 sm:px-6 py-2 sm:py-4 gap-2 sm:gap-4">

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 flex-shrink-0 active:bg-gray-200 transition-colors touch-manipulation"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar - Optimized for mobile */}
        <div className="relative flex-1 max-w-md">
          <form onSubmit={handleSearch} className="bg-white/70 backdrop-blur-sm h-[44px] sm:h-[48px] rounded-xl sm:rounded-2xl flex items-center px-3 sm:px-4 border border-white/50 shadow-sm transition-all touch-manipulation">
            <Search className="h-5 w-5 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="ml-2 sm:ml-3 bg-transparent border-none outline-none flex-1 text-[15px] sm:text-sm text-gray-800 placeholder:text-gray-500 min-w-0 py-2"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </form>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <nav className="hidden xl:flex gap-6 lg:gap-8">
          <Link to="/dashboard" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">Home</Link>
          <Link to="/profile" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">About Us</Link>
          <Link to="/books" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">E-books</Link>
          <Link to="/contact" className="text-gray-800 hover:text-gray-900 transition-colors text-sm font-medium">Contact Us</Link>
        </nav>

        {/* Right side - User Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            ref={buttonRef}
            onClick={() => {
              setIsProfileDropdownOpen(!isProfileDropdownOpen)
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-2.5 sm:px-4 py-2.5 border border-white/50 shadow-sm hover:bg-white/80 transition-colors active:bg-white/90 touch-manipulation min-h-[44px]"
            aria-label="User menu"
          >
            <User className="h-5 w-5 text-gray-600" />
            <span className="hidden sm:block text-gray-800 font-medium text-sm truncate max-w-[120px]">
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