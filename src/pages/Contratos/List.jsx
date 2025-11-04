import { useEffect, useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterCableoperador, setFilterCableoperador] = useState('')

  useEffect(() => {
    loadData(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const loadData = async (pageToLoad = 1) => {
    try {
      setLoading(true)

      // Si hay término de búsqueda, usar búsqueda del servidor (opción A)
      if (searchTerm && searchTerm.trim() !== '') {
        const contratosResp = await contratosService.getAllFull({ page: pageToLoad, search: searchTerm })
        console.log('Contratos (búsqueda por servidor) cargados:', contratosResp)
        const items = contratosResp?.results || []
        // Obtener igualmente los cable-operadores para el select
        const cableoperadoresResp = await cableoperadoresService.getAllAllPages()
        const cableoperadoresArray = Array.isArray(cableoperadoresResp?.results)
          ? cableoperadoresResp.results
          : (cableoperadoresResp?.results || cableoperadoresResp || [])

        setContratos(items)
        setCableoperadores(cableoperadoresArray)
        setTotalCount(contratosResp?.count || items.length)
        setPageSize(items.length)
      } else {
        // Cargar página específica desde el servidor
        const [contratosResp, cableoperadoresResp] = await Promise.all([
          contratosService.getAllFull({ page: pageToLoad }),
          // Obtener todos los cable-operadores (todas las páginas) para el select de filtro
          cableoperadoresService.getAllAllPages(),
        ])

        console.log('Contratos página cargada:', contratosResp)
        console.log('Cable-operadores cargados:', cableoperadoresResp)

        const contratosArray = contratosResp?.results || []
        const cableoperadoresArray = Array.isArray(cableoperadoresResp?.results)
          ? cableoperadoresResp.results
          : (cableoperadoresResp?.results || cableoperadoresResp || [])

        setContratos(contratosArray)
        setCableoperadores(cableoperadoresArray)
        setTotalCount(contratosResp?.count || contratosArray.length)
        setPageSize(contratosArray.length)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error.response?.data || error.message)
      toast.error(`Error al cargar datos: ${error.response?.data?.detail || error.message}`)
      setContratos([])
      setCableoperadores([])
    } finally {
      setLoading(false)
    }
  }

  // Cuando cambia el término de búsqueda, recargar (buscar en todas las páginas)
  useEffect(() => {
    // Si hay búsqueda, resetear a página 1 y cargar todo en cliente
    if (searchTerm && searchTerm.trim() !== '') {
      loadData(1)
    } else {
      // Si se borró la búsqueda, volver a cargar la página actual desde servidor
      loadData(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contrato?')) {
      try {
        await contratosService.delete(id)
        toast.success('Contrato eliminado')
        loadData()
      } catch (error) {
        toast.error('Error al eliminar contrato')
      }
    }
  }

  console.log('Estado actual de contratos:', contratos)
  
  const filteredContratos = contratos.filter((contrato) => {
    console.log('Procesando contrato:', contrato)
    
    const matchesSearch =
      String(contrato.cableoperador?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(contrato.cableoperador?.nombre_largo || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = !filterEstado || contrato.estado_contrato === filterEstado
    
    const matchesCableoperador =
      !filterCableoperador || contrato.cableoperador?.id === parseInt(filterCableoperador)

    const result = matchesSearch && matchesEstado && matchesCableoperador
    console.log('Resultado del filtro:', { matchesSearch, matchesEstado, matchesCableoperador, result })
    
    return result
  })

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Contratos</h2>
        <Link to="/contratos/nuevo">
          <Button variant="primary">➕ Nuevo Contrato</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por cable-operador... (Enter para buscar)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1)
                setSearchTerm(searchInput)
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filtrar por Estado"
            name="filterEstado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Vigente', label: 'Vigente' },
              { value: 'Vencido', label: 'Vencido' },
            ]}
          />
          <Select
            label="Filtrar por Cable-operador"
            name="filterCableoperador"
            value={filterCableoperador}
            onChange={(e) => setFilterCableoperador(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              ...cableoperadores.map((co) => ({
                value: co.id.toString(),
                label: co.nombre,
              })),
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredContratos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No se encontraron contratos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Cable-operador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Vigencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContratos.map((contrato) => (
                  <tr key={contrato.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contrato.cableoperador?.nombre || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          contrato.estado_contrato === 'Vigente'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {contrato.estado_contrato}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(contrato.valor_contrato)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contrato.inicio_vigencia)} - {formatDate(contrato.fin_vigencia)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/contratos/${contrato.id}/detalle`}>
                        <Button variant="primary" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <Link to={`/contratos/${contrato.id}/editar`}>
                        <Button variant="secondary" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(contrato.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-white border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {contratos.length} de {totalCount} contratos
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
        )}
      </div>
    </div>
  )
}

export default ContratosList

