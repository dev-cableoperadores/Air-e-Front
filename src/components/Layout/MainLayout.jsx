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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden"> {/* 1. Evita el scroll horizontal en el body */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((v) => !v)}
      />
      
      {/* 2. Añadimos min-w-0 para que el flex-1 no desborde el ancho disponible */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-72'
      }`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* 3. overflow-x-hidden aquí es clave para que el mapa/tablas no rompan el layout */}
        <main className="flex-1 px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-5 lg:px-6 lg:py-6 overflow-y-auto overflow-x-hidden">
          
          {/* 4. Cambiamos max-w-full por un control más estricto si es necesario */}
          <div className="mx-auto w-full min-w-0 transition-all duration-300 max-w-full">
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

