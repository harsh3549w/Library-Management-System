import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen scroll-smooth">
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen}
        desktopOpen={desktopSidebarOpen}
        setDesktopOpen={setDesktopSidebarOpen}
      />
      
      <div className={`transition-all duration-300 ${desktopSidebarOpen ? 'lg:pl-80' : 'lg:pl-20'}`}>
        <div className={`fixed top-0 right-0 z-50 transition-all duration-300 ${desktopSidebarOpen ? 'left-0 lg:left-80' : 'left-0 lg:left-20'}`}>
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            onDesktopMenuClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
            desktopSidebarOpen={desktopSidebarOpen}
          />
        </div>
        
        <main className="pt-24 pb-6 scroll-smooth">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
