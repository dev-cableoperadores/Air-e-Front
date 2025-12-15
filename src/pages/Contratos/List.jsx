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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 text-2xl font-bold text-gray-800">Contratos</h1>
        <Link to="/contratos/nuevo">
          <Button variant="primary">➕ Nuevo Contrato</Button>
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 flex gap-2">
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Buscar
        </button>
        <button
          onClick={handleClearSearch}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800"
        >
          Limpiar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-blue-100 mb-6 flex gap-4">
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
      <div className="bg-blue-100 shadow rounded-lg overflow-hidden">
        {contratos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron contratos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cableoperador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inicio de Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contratos.map((contrato) => (
                  <tr key={contrato.id}>
                    <td className="px-6 py-4 **max-w-xs** **overflow-hidden** **text-ellipsis**">
                        {/* Nota: Hemos quitado whitespace-nowrap para que se aplique el truncado. 
                          Si lo dejas, el texto se fuerza a una sola línea y se trunca. */}
                        {contrato.cableoperador?.nombre_largo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contrato.estado_contrato === 'Vigente'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {contrato.estado_contrato}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(contrato.valor_contrato)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contrato.duracion_anos} años
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(contrato.inicio_vigencia)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/contratos/${contrato.id}/detalle`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Button variant="primary" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <Link
                        to={`/contratos/${contrato.id}/editar`}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                       <Button variant="secondary" size="sm">
                          Editar
                        </Button>
                      </Link>
                      {/* <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(contrato.id)}
                      >
                        Eliminar
                      </Button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      <div className="mt-6 flex justify-between items-center">
        <p className="text-2xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-2xl font-bold text-gray-800">
          Mostrando {contratos.length} de {totalCount} contratos
        </p>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              if (page > 1) setPage(page - 1)
            }}
            disabled={page <= 1}
            className={`px-3 py-1 rounded ${
              page <= 1
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Anterior
          </button>
          <span className="text-2xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 text-2xl font-bold text-gray-800">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => {
              if (page < totalPages) setPage(page + 1)
            }}
            disabled={page >= totalPages}
            className={`px-3 py-1 rounded ${
              page >= totalPages
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContratosList
