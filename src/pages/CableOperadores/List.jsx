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

// 🚨 1. Función estable para cargar Cableoperadores
  // Usamos useCallback. Ahora depende solo de searchTerm.
  const loadCableoperadores = useCallback(async (pageToLoad = 1) => {
      try {
          setLoading(true)
          
          // Usar la página actual si no se especifica una (ej. al cambiar búsqueda)
          const actualPage = pageToLoad; 

          // Construir parámetros de la solicitud
          const params = { page: actualPage };
          if (searchTerm && searchTerm.trim() !== '') {
              params.search = searchTerm;
          }

          const resp = await cableoperadoresService.getAllFull(params);
          const items = resp?.results || [];
              
          setCableoperadores(items);
          setTotalCount(resp?.count || items.length);
          setPageSize(items.length);
          setPage(actualPage); // Actualiza la página después de cargar

      } catch (error) {
          console.error('Error al cargar cableoperadores:', error.response?.data || error.message)
          toast.error(`Error al cargar cableoperadores: ${error.response?.data?.detail || error.message}`)
          setCableoperadores([])
      } finally {
          setLoading(false)
      }
  }, [searchTerm]) // 🚨 CLAVE: Solo depende de searchTerm

  // 🚨 2. useEffect para Paginación (Se ejecuta al cambiar la página)
  useEffect(() => {
      // Ejecutar loadCableoperadores cuando la página cambie
      loadCableoperadores(page)
  }, [page, loadCableoperadores]) 

  // 🚨 3. useEffect para Búsqueda (Se ejecuta al cambiar el término de búsqueda)
  useEffect(() => {
      // Cuando cambia el término, forzar la recarga en la página 1.
      // Esto automáticamente dispara el useEffect de [page].
      if (searchTerm !== '') {
          setPage(1); 
      } else {
            // Si se borra la búsqueda, forzar recarga de la página actual.
          loadCableoperadores(page);
      }
  }, [searchTerm, loadCableoperadores]) 

  const handleDelete = async (id, nombre) => {
      // ... (lógica de eliminación)
      if (window.confirm(`¿Estás seguro de eliminar ${nombre}?`)) {
          try {
              await cableoperadoresService.delete(id)
              toast.success('Cableoperador eliminado')
              // Recargar la página actual
              loadCableoperadores(page) 
          } catch (error) {
              toast.error('Error al eliminar cableoperador')
          }
      }
  }

  const filteredCableoperadores = cableoperadores.filter((co) =>
    co.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    co.nombre_largo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    co.NIT?.toString().includes(searchTerm)
  )

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Cableoperadores
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los cableoperadores del sistema
          </p>
        </div>
        <Link to="/cableoperadores/nuevo">
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cableoperador
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre, nombre largo o NIT... (Enter para buscar)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1)
                  setSearchTerm(searchInput)
                }
              }}
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setPage(1)
                setSearchTerm(searchInput)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
              className="px-4 py-2 bg-gray-100 rounded-lg"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredCableoperadores.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Cable className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No se encontraron cableoperadores</p>
          </div>
        ) : (
          filteredCableoperadores.map((co) => (
            <div 
              key={co.id} 
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-4">
                <h3 className="text-lg font-bold text-center truncate">{co.nombre_largo}</h3>
              </div>
              
              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Municipio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.ciudad || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">NIT</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.NIT || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {co.telefono ? formatPhone(co.telefono) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Link to={`/cableoperadores/${co.id}/detalle`} className="flex-1">
                    <button className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </button>
                  </Link>
                  <Link to={`/cableoperadores/${co.id}/editar`} className="flex-1">
                    <button className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(co.id, co.nombre)}
                    className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 px-4 py-3 bg-white border-t flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Mostrando {cableoperadores.length} de {totalCount} cableoperadores
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { if (page > 1) setPage(page - 1) }}
            disabled={page <= 1}
            className={`px-3 py-1 rounded ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Anterior
          </button>
          <div className="text-sm">Página {page} de {Math.max(1, Math.ceil(totalCount / (pageSize || totalCount || 1)))}</div>
          <button
            onClick={() => { if (page < Math.ceil(totalCount / (pageSize || totalCount || 1))) setPage(page + 1) }}
            disabled={page >= Math.ceil(totalCount / (pageSize || totalCount || 1))}
            className={`px-3 py-1 rounded ${page >= Math.ceil(totalCount / (pageSize || totalCount || 1)) ? 'opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default CableOperadoresList

