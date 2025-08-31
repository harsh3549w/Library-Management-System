import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header 
          user={user} 
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
