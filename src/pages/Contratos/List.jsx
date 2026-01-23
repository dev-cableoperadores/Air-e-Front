import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import Select from '../../components/UI/Select'
import { formatCurrency, formatDate } from '../../utils/formatters'

const ContratosList = () => {
  const [contratos, setContratos] = useState([])
  const [cableoperadores, setCableoperadores] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterCableoperador, setFilterCableoperador] = useState('')

  // Función para cargar contratos con filtros aplicados en el servidor
  const loadContratos = useCallback(async (pageToLoad = 1) => {
    try {
      setLoading(true)
      
      // Construir parámetros para el API
      const params = {
        page: pageToLoad,
      }

      // Agregar búsqueda si existe
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim()
      }

      // Agregar filtro de estado si existe
      if (filterEstado) {
        params.estado_contrato = filterEstado
      }

      // Agregar filtro de cableoperador si existe
      if (filterCableoperador) {
        params.cableoperador = filterCableoperador
      }

      const contratosResp = await contratosService.getAllFull(params)
      
      const contratosArray = contratosResp?.results || []
      setContratos(contratosArray)
      setTotalCount(contratosResp?.count || contratosArray.length)
      setPageSize(contratosArray.length)
    } catch (error) {
      toast.error(`Error al cargar datos: ${error.response?.data?.detail || error.message}`)
      setContratos([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterEstado, filterCableoperador])

  // Carga inicial de cableoperadores (solo una vez)
  useEffect(() => {
    const loadCableoperadores = async () => {
      try {
        const cableoperadoresResp = await cableoperadoresService.getAllAllPages()
        const cableoperadoresArray = Array.isArray(cableoperadoresResp?.results) 
          ? cableoperadoresResp.results 
          : (cableoperadoresResp?.results || cableoperadoresResp || [])
        setCableoperadores(cableoperadoresArray)
      } catch (error) {
        console.error('Error al cargar cableoperadores:', error)
        toast.error('Error al cargar la lista de cableoperadores.')
      }
    }
    loadCableoperadores()
  }, [])

  // Cargar contratos cuando cambian los filtros o la página
  useEffect(() => {
    loadContratos(page)
  }, [page, searchTerm, filterEstado, filterCableoperador, loadContratos])

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contrato?')) {
      try {
        await contratosService.delete(id)
        toast.success('Contrato eliminado')
        loadContratos(page)
      } catch (error) {
        toast.error('Error al eliminar contrato')
      }
    }
  }

  const handleSearch = () => {
    setPage(1)
    setSearchTerm(searchInput)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setPage(1)
  }

  const handleEstadoChange = (e) => {
    setFilterEstado(e.target.value)
    setPage(1) // Volver a la primera página cuando cambia el filtro
  }

  const handleCableoperadorChange = (e) => {
    setFilterCableoperador(e.target.value)
    setPage(1) // Volver a la primera página cuando cambia el filtro
  }

  if (loading) {
    return <Loading />
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || totalCount || 1)))
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-x-hidden px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Contratos</h1>
        <Link to="/contratos/nuevo" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto text-xs sm:text-sm">➕ Nuevo</Button>
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Buscar por cableoperador..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            className="flex-1 px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded-lg font-medium transition-colors"
            >
              Buscar
            </button>
            <button
              onClick={handleClearSearch}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs sm:text-sm rounded-lg font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-2 sm:p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        <Select
          label="Estado"
          value={filterEstado}
          onChange={handleEstadoChange}
          options={[
            { value: '', label: 'Todos' },
            { value: 'Vigente', label: 'Vigente' },
            { value: 'Vencido', label: 'Vencido' },
            { value: 'Pendiente', label: 'Pendiente' },
          ]}
        />
        <Select
          label="Cableoperador"
          value={filterCableoperador}
          onChange={handleCableoperadorChange}
          options={[
            { value: '', label: 'Todos' },
            ...cableoperadores.map((co) => ({
              value: co.id.toString(),
              label: co.nombre_largo || co.nombre || 'N/A',
            })),
          ]}
        />
      </div>

      {/* Tabla de contratos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {contratos.length === 0 ? (
          <div className="text-center py-6 sm:py-8 md:py-12 px-4">
            <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400">No se encontraron contratos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
              <thead className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-300 dark:border-blue-600">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Cableoperador
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100">
                    Estado
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden sm:table-cell">
                    Valor
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden md:table-cell">
                    Vigencia
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden lg:table-cell">
                    Inicio
                  </th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {contratos.map((contrato) => (
                  <tr key={contrato.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                      <p className="text-gray-900 dark:text-gray-100 font-medium truncate text-xs sm:text-sm">
                        {contrato.cableoperador?.nombre_largo || 'N/A'}
                      </p>
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                      <span
                        className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          contrato.estado_contrato === 'Vigente'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {contrato.estado_contrato}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden sm:table-cell text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      {formatCurrency(contrato.valor_contrato)}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden md:table-cell text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      {contrato.duracion_anos} años
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 hidden lg:table-cell text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                      {formatDate(contrato.inicio_vigencia)}
                    </td>
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                      <div className="flex gap-1 justify-center">
                        <Link to={`/contratos/${contrato.id}/detalle`}>
                          <Button variant="primary" size="sm" className="text-xs">
                            Ver
                          </Button>
                        </Link>
                        <Link to={`/contratos/${contrato.id}/editar`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
        <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 font-medium text-center sm:text-left">
          Mostrando {contratos.length} de {totalCount}
        </p>
        <div className="flex gap-1 sm:gap-2 items-center justify-center">
          <button
            onClick={() => {
              if (page > 1) setPage(page - 1)
            }}
            disabled={page <= 1}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded font-medium transition-colors ${
              page <= 1
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400'
            }`}
          >
            ← Anterior
          </button>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => {
              if (page < totalPages) setPage(page + 1)
            }}
            disabled={page >= totalPages}
            className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded font-medium transition-colors ${
              page >= totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400'
            }`}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )

}

export default ContratosList
