import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Cable, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/cableoperadores', label: 'Cableoperadores', icon: Cable },
    { path: '/contratos', label: 'Contratos', icon: FileText },
  ]

  const isActiveRoute = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const SidebarContent = ({ expanded = false }) => (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 transition-all duration-300 border-r border-gray-200 dark:border-gray-700 ${
      (expanded ? false : isCollapsed) ? 'w-16' : 'w-72'
    }`}>
      {/* Logo Header */}
      <div className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 h-16 ${
        (expanded ? false : isCollapsed) ? 'px-3' : 'px-6'
      }`}>
        {!(expanded ? false : isCollapsed) && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 overflow-hidden flex items-center justify-center flex-shrink-0 bg-white">
              <img
                src="/logo-aire-intervenida.png"
                alt="AIR-E"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 truncate">AIR-E</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">Gestión</span>
            </div>
          </div>
        )}
        
        {(expanded ? false : isCollapsed) && (
          <div className="w-10 h-10 overflow-hidden flex items-center justify-center bg-white">
            <img
              src="/logo-aire-intervenida.png"
              alt="AIR-E"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Collapse Toggle - Only show on desktop */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            (expanded ? false : isCollapsed) && 'mx-auto'
          }`}
        >
          {(expanded ? false : isCollapsed) ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${
        (expanded ? false : isCollapsed) ? 'px-2' : 'px-4'
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = isActiveRoute(item.path)

          return (
            <div key={item.path} className="relative group">
              <NavLink
                to={item.path}
                onClick={onClose}
                className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  (expanded ? false : isCollapsed) ? 'px-3 py-3 justify-center' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute bg-blue-600 dark:bg-blue-400 rounded-r-full ${
                    (expanded ? false : isCollapsed) ? 'left-0 top-2 bottom-2 w-1' : 'left-0 top-0 bottom-0 w-1'
                  }`}></div>
                )}
                <Icon className={`w-5 h-5 transition-colors flex-shrink-0 ${
                  (expanded ? false : isCollapsed) ? 'mx-auto' : 'mr-3'
                } ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`} />
                {!(expanded ? false : isCollapsed) && <span className="truncate">{item.label}</span>}
              </NavLink>
              
              {/* Tooltip for collapsed state */}
              {(expanded ? false : isCollapsed) && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-200 dark:border-gray-700 mt-auto ${
        (expanded ? false : isCollapsed) ? 'px-2 py-3' : 'px-4 py-4'
      }`}>
        {!(expanded ? false : isCollapsed) ? (
          <div className="space-y-2">
            {/* Version */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Versión
              </span>
              <span className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                v1.0.0
              </span>
            </div>
            
            {/* Copyright */}
            <div className="text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                © 2025 AIR-E
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                Todos los derechos reservados
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {/* Version indicator for collapsed state */}
            <div className="w-2 h-2 bg-green-500 rounded-full" title="v1.0.0"></div>
            <div className="text-xs text-gray-400 dark:text-gray-500 transform -rotate-90 whitespace-nowrap">
              © 2025
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!isOpen}>
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
            role="presentation"
          />
          <div
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 h-full w-72 max-w-[85vw] sm:max-w-sm focus:outline-none shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menú lateral"
          >
            <SidebarContent expanded />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30 transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-72'
      }`}>
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar

