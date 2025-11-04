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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterCableoperador, setFilterCableoperador] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [contratosData, cableoperadoresData] = await Promise.all([
        contratosService.getAll(),
        // Obtener todos los cable-operadores (todas las páginas) para el select de filtro
        cableoperadoresService.getAllAllPages(),
      ])
      console.log('Contratos cargados:', contratosData)
      console.log('Cable-operadores cargados:', cableoperadoresData)
      
      // Asegurarse de que ambos sean arrays
      const contratosArray = Array.isArray(contratosData) ? contratosData : []
      const cableoperadoresArray = Array.isArray(cableoperadoresData?.results)
        ? cableoperadoresData.results
        : (cableoperadoresData?.results || cableoperadoresData || [])

      setContratos(contratosArray)
      setCableoperadores(cableoperadoresArray)
    } catch (error) {
      console.error('Error al cargar datos:', error.response?.data || error.message)
      toast.error(`Error al cargar datos: ${error.response?.data?.detail || error.message}`)
      setContratos([])
      setCableoperadores([])
    } finally {
      setLoading(false)
    }
  }

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
        <input
          type="text"
          placeholder="Buscar por cable-operador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
          </div>
        )}
      </div>
    </div>
  )
}

export default ContratosList

