import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  X, 
  Home, 
  BookOpen, 
  UserCheck, 
  Plus, 
  Library,
  BarChart3,
  ThumbsUp,
  Bookmark,
  FileText,
  Upload,
  DollarSign,
  Receipt,
  PieChart,
  UserPlus,
  Edit,
  Gift,
  Users
} from 'lucide-react'

const Sidebar = ({ open, setOpen, desktopOpen, setDesktopOpen }) => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'Admin'

  const navigation = isAdmin ? [
    // Admin navigation
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'Add Book', href: '/admin/add-book', icon: Plus },
    { name: 'Add User', href: '/admin/add-user', icon: UserPlus },
    { name: 'Batch Register', href: '/admin/batch-register', icon: Users },
    { name: 'Archives', href: '/archives', icon: FileText },
    { name: 'Upload Archive', href: '/admin/upload-archive', icon: Upload },
    { name: 'All Borrowed Books', href: '/admin/all-borrowed-books', icon: UserCheck },
    { name: 'All Reservations', href: '/admin/all-reservations', icon: Bookmark },
    { name: 'Manage Fines', href: '/admin/manage-fines', icon: DollarSign },
    { name: 'All Transactions', href: '/admin/all-transactions', icon: Receipt },
    { name: 'Reports', href: '/admin/reports', icon: PieChart },
    { name: 'Manage Suggestions', href: '/admin/manage-suggestions', icon: BarChart3 },
    { name: 'Manage Donations', href: '/admin/manage-donations', icon: Gift },
  ] : [
    // User navigation
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Books', href: '/books', icon: BookOpen },
    { name: 'My Borrowed Books', href: '/my-borrowed-books', icon: Library },
    { name: 'My Reservations', href: '/my-reservations', icon: Bookmark },
    { name: 'My Fines', href: '/my-fines', icon: DollarSign },
    { name: 'My Transactions', href: '/my-transactions', icon: Receipt },
    { name: 'Archives', href: '/archives', icon: FileText },
    { name: 'Book Suggestions', href: '/book-suggestions', icon: ThumbsUp },
    { name: 'Donate Book', href: '/donate-book', icon: Gift },
    { name: 'My Donations', href: '/my-donations', icon: BookOpen },
    { name: 'Edit Info', href: '/edit-info', icon: Edit },
  ]

  const SidebarContent = ({ isCollapsed = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-20 px-6 border-b border-white/30">
        <Link to="/dashboard" className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`${isCollapsed ? 'h-12 w-12' : 'h-16 w-16'} bg-white/60 backdrop-blur-sm rounded-lg p-2 shadow-sm transition-all duration-300`}>
              <img
                src="https://res.cloudinary.com/ds5kihtow/image/upload/v1761401617/library-static/iiitdm-logo.webp"
                alt="IIITDM Logo"
                className="w-full h-full object-cover rounded-lg"
                style={{ border: 'none', outline: 'none' }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-4">
              <h1 className="text-xl font-semibold text-gray-700">E-Library</h1>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 pb-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className="h-[17px] w-[17px]" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      {!isCollapsed && (
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-white/30 bg-white/5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
            </div>
            <div className="ml-4 overflow-hidden">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.name || 'Test Admin'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="flex-shrink-0 p-4 border-t border-white/30 flex justify-center bg-white/5">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </span>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col h-full glass-dark">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${desktopOpen ? 'lg:w-80' : 'lg:w-20'}`}>
        <div className="flex flex-col flex-grow glass-dark border-r border-white/30">
          <SidebarContent isCollapsed={!desktopOpen} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
