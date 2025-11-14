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
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterCableoperador, setFilterCableoperador] = useState('')

// 🚨 1. Función estable para cargar SOLO Contratos
  // Usa useCallback para evitar re-creación innecesaria, solo se actualiza si searchTerm cambia.
  const loadContratos = useCallback(async (pageToLoad = 1) => {
      try {
          setLoading(true)
          let contratosResp;

          // Si hay término de búsqueda, usar búsqueda del servidor 
          if (searchTerm && searchTerm.trim() !== '') {
              // Solo cargamos contratos, los cableoperadores ya están en el estado
              contratosResp = await contratosService.getAllFull({ page: pageToLoad, search: searchTerm })
          } else {
              // Cargar página específica desde el servidor
              contratosResp = await contratosService.getAllFull({ page: pageToLoad })
          }
          
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
  }, [searchTerm]) // Dependencia: solo searchTerm

  // 🚨 2. Carga inicial de Cableoperadores (Se ejecuta SOLO una vez al montar)
  useEffect(() => {
      const loadCableoperadores = async () => {
          try {
              // 🛠️ Esta llamada costosa se hace SOLO al montar el componente.
              const cableoperadoresResp = await cableoperadoresService.getAllAllPages()
              const cableoperadoresArray = Array.isArray(cableoperadoresResp?.results)
                  ? cableoperadoresResp.results
                  : (cableoperadoresResp?.results || cableoperadoresResp || [])
              setCableoperadores(cableoperadoresArray)
          } catch (error) {
              console.error('Error al cargar cableoperadores para filtros:', error);
              toast.error('Error al cargar la lista de cableoperadores.');
          }
      }
      loadCableoperadores();
  }, []) // 🚨 Dependencia vacía: se ejecuta una sola vez al montar.


  // 🚨 3. useEffect para Paginación (Cambio de página o primer montaje sin búsqueda)
  useEffect(() => {
      // Lógica de paginación normal (solo si no estamos en modo búsqueda)
      if (!searchTerm) {
          loadContratos(page)
      }
  }, [page, searchTerm, loadContratos]) 

  // 🚨 4. useEffect para la Búsqueda
  useEffect(() => {
      // Cuando cambia el término de búsqueda, forzamos la recarga en la página 1
      if (searchTerm && searchTerm.trim() !== '') {
          loadContratos(1)
      } else {
          // Si la búsqueda se vacía, forzamos la recarga de la página actual
            loadContratos(page)
      }
  }, [searchTerm, loadContratos, page])

  const handleDelete = async (id) => {
      if (window.confirm('¿Estás seguro de eliminar este contrato?')) {
          try {
              await contratosService.delete(id)
              toast.success('Contrato eliminado')
              loadContratos(page) // Recargar la página actual
          } catch (error) {
              toast.error('Error al eliminar contrato')
          }
      }
  }

  //console.log('Estado actual de contratos:', contratos)
  
  const filteredContratos = contratos.filter((contrato) => {
    //console.log('Procesando contrato:', contrato)
    
    const matchesSearch =
      String(contrato.cableoperador?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(contrato.cableoperador?.nombre_largo || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = !filterEstado || contrato.estado_contrato === filterEstado
    
    const matchesCableoperador =
      !filterCableoperador || contrato.cableoperador?.id === parseInt(filterCableoperador)

    const result = matchesSearch && matchesEstado && matchesCableoperador
    //console.log('Resultado del filtro:', { matchesSearch, matchesEstado, matchesCableoperador, result })
    
    return result
  })

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 text-2xl font-bold text-gray-800">Contratos</h2>
        <Link to="/contratos/nuevo">
          <Button variant="primary">➕ Nuevo Contrato</Button>
        </Link>
      </div>

      <div className="  space-y-4">
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
            className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800 "
          >
            Limpiar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-gray-800">
          <Select
            label="Filtrar por Estado"
            name="filterEstado "
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Vigente', label: 'Vigente' },
              { value: 'Vencido', label: 'Vencido' },
            ]}
          />
          <Select
            label="Filtrar por Cableoperador"
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

      <div className=" rounded-lg shadow-md overflow-hidden dark:text-gray-100 text-2xl font-bold text-gray-800">
        {filteredContratos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-100 text-2xl font-bold text-gray-800">
            <p>No se encontraron contratos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Cableoperador
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
                        className={`px-2 py-1 text-xs font-semibold rounded-full${
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
            <div className="px-4 py-3 border-t flex items-center justify-between">
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

