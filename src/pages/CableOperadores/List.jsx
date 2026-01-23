import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Edit, Trash2, Cable } from 'lucide-react'
import { toast } from 'react-hot-toast'
import cableoperadoresService from '../../services/cableoperadoresService'
import Loading from '../../components/UI/Loading'
import { formatPhone, formatNumber } from '../../utils/formatters'

const CableOperadoresList = () => {
  const [cableoperadores, setCableoperadores] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const navigate = useNavigate()

  // 1. useCallback ahora recibe la página y el término de búsqueda como argumentos.
  // Su array de dependencias está vacío para que la función sea estable.
  const loadCableoperadores = useCallback(async (pageToLoad, currentSearchTerm) => {
    try {
      setLoading(true)
      const params = { page: pageToLoad }

      if (currentSearchTerm && currentSearchTerm.trim() !== '') {
        params.search = currentSearchTerm
      }

      const resp = await cableoperadoresService.getAllFull(params)
      const items = resp?.results || []

      setCableoperadores(items)
      setTotalCount(resp?.count || items.length)
      setPageSize(items.length)
      setPage(pageToLoad) // Actualiza el estado de la página si la carga fue exitosa
    } catch (error) {
      console.error('Error al cargar cableoperadores:', error.response?.data || error.message)
      toast.error(`Error al cargar cableoperadores: ${error.response?.data?.detail || error.message}`)
      setCableoperadores([])
    } finally {
      setLoading(false)
    }
  }, []) // Dependencia vacía para estabilidad.

  // 2. Único useEffect para manejar la carga de datos.
  // Se activa cuando 'page' o 'searchTerm' cambian.
  useEffect(() => {
    loadCableoperadores(page, searchTerm)
  }, [page, searchTerm, loadCableoperadores]) 

  const handleDelete = async (id, nombre) => {
      // ... (lógica de eliminación)
      if (window.confirm(`¿Estás seguro de eliminar ${nombre}?`)) {
          try {
              await cableoperadoresService.delete(id)
              toast.success('Cableoperador eliminado')
              // Recargar los datos de la página actual con el término de búsqueda actual
              loadCableoperadores(page, searchTerm)
          } catch (error) {
              toast.error('Error al eliminar cableoperador')
          }
      }
  }

  // 3. Lógica para manejar el envío de una nueva búsqueda.
  const handleSearch = () => {
    setSearchTerm(searchInput)
    // Si ya estamos en la página 1, el useEffect no se disparará por el cambio de página,
    // pero sí por el cambio en searchTerm. Si estamos en otra página,
    // setPage(1) disparará el useEffect.
    if (page !== 1) {
      setPage(1)
    }
  }

  // El filtrado ahora se hace en el backend, por lo que no es necesario
  // un filtrado local. Simplemente usamos los datos que vienen del estado.
  const filteredCableoperadores = cableoperadores
  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Cableoperadores
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los cableoperadores del sistema
          </p>
        </div>
        <Link to="/cableoperadores/nuevo">
          <button className="flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded-lg whitespace-nowrap"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                setSearchTerm('')
                setPage(1)
              }}
              className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-lg whitespace-nowrap"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredCableoperadores.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <Cable className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No se encontraron cableoperadores</p>
          </div>
        ) : (
          filteredCableoperadores.map((co) => (
            <div 
              key={co.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-3 sm:p-4">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-center truncate">{co.nombre_largo}</h3>
              </div>
              
              {/* Card Body */}
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Nombre</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Municipio</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.ciudad || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">NIT</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.NIT || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Teléfono</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.telefono ? formatPhone(co.telefono) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link to={`/cableoperadores/${co.id}/detalle`} className="flex-1">
                    <button className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors">
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Ver
                    </button>
                  </Link>
                  <Link to={`/cableoperadores/${co.id}/editar`} className="flex-1">
                    <button className="w-full flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors">
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Editar
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      <div className="mt-4 px-2 sm:px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 text-center sm:text-left">
          Mostrando {cableoperadores.length} de {totalCount}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => { if (page > 1) setPage(page - 1) }}
            disabled={page <= 1}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'}`}>
            Anterior
          </button>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            Pág. {page} de {Math.max(1, Math.ceil(totalCount / (pageSize || totalCount || 1)))}
          </div>
          <button
            onClick={() => { if (page < Math.ceil(totalCount / (pageSize || totalCount || 1))) setPage(page + 1) }}
            disabled={page >= Math.ceil(totalCount / (pageSize || totalCount || 1))}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${page >= Math.ceil(totalCount / (pageSize || totalCount || 1)) ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'}`}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default CableOperadoresList
