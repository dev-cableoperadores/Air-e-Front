import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ErrorBoundary from '../ErrorBoundary'

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  // Initialize theme on mount
  useEffect(() => {
    const root = document.documentElement
    const savedTheme = localStorage.getItem('theme') || 'light'
    if (savedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((v) => !v)}
      />
      
      <div className={`bg-white-100 flex flex-col flex-1 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-72'
      }`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-5 lg:px-6 lg:py-6 overflow-auto touch-pan-x touch-pan-y">
          <div className="mx-auto w-full transition-all duration-300 max-w-full lg:max-w-6xl xl:max-w-7xl">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout

