import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Loading from '../../components/UI/Loading'
import { formatDate, formatNumber, formatMonthYear } from '../../utils/formatters'

const FacturasList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [facturas, setFacturas] = useState([])
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
  })
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const location = useLocation()

  useEffect(() => {
    // Si la query string cambia (por ejemplo navegando desde Dashboard con ?estado=Pendiente)
    // aplicamos los filtros iniciales (estado, page) y recargamos la página correspondiente.
    const params = new URLSearchParams(location.search)
    const estadoParam = params.get('estado') || ''
    const pageParam = parseInt(params.get('page') || '1', 10)

    // Actualizar filtros y página según la query
    setFiltros((prev) => ({ ...prev, estado: estadoParam }))
    setCurrentPage(isNaN(pageParam) ? 1 : pageParam)
    // loadFacturas se ejecutará por el efecto que depende de currentPage
  }, [location.search])

  useEffect(() => {
    // Cargar facturas al montar y cuando cambie la página.
    // Los filtros se aplican en cliente para evitar llamadas extra al API.
    loadFacturas()
  }, [currentPage])

  const loadFacturas = async () => {
    try {
      setLoading(true)
      const params = {}
      if (currentPage > 1) params.page = currentPage

      // Traer solo la página solicitada. Los filtros se harán en cliente.
      const data = await facturasService.getAllFull(params)
      setFacturas(data.results || [])
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      })
    } catch (error) {
      toast.error('Error al cargar facturas')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros({ ...filtros, [name]: value })
    setCurrentPage(1)
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta factura?')) {
      try {
        await facturasService.delete(id)
        toast.success('Factura eliminada')
        loadFacturas()
      } catch (error) {
        toast.error('Error al eliminar factura')
      }
    }
  }

  if (loading && facturas.length === 0) {
    return <Loading fullScreen />
  }

  const itemsPerPage = 10
  const totalPages = Math.ceil(pagination.count / itemsPerPage)

  // Aplicar filtros en cliente (no hacen llamadas al API)
  const filteredFacturas = facturas.filter((factura) => {
    const term = (filtros.search || '').toLowerCase()
    const cableName = (typeof factura.cableoperador === 'string')
      ? factura.cableoperador
      : (factura.cableoperador?.nombre || factura.cableoperador?.nombre_largo || '')

    const matchesSearch = !term || (
      String(factura.Num_factura || '').toLowerCase().includes(term) ||
      String(cableName).toLowerCase().includes(term)
    )

    const matchesEstado = !filtros.estado || factura.estado === filtros.estado

    return matchesSearch && matchesEstado
  })

  const getEstadoColor = (estado) => {
    const colors = {
      'Pendiente': 'text-yellow-600 bg-yellow-50',
      'PagadaParcial': 'text-blue-600 bg-blue-50',
      'Pagada': 'text-green-600 bg-green-50',
      'Anulada': 'text-red-600 bg-red-50',
    }
    return colors[estado] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 text-2xl font-bold text-gray-800">Facturas</h2>
        <Button onClick={() => navigate('/facturas/nueva')} variant="primary">
          Nueva Factura
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar por Número de Factura o Cable-Operador"
            name="search"
            type="text"
            placeholder="Número de factura..."
            value={filtros.search}
            onChange={handleFiltroChange}
          />
          <Select
            label="Estado"
            name="estado"
            value={filtros.estado}
            onChange={handleFiltroChange}
            options={[
              { value: '', label: 'Todos' },
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'PagadaParcial', label: 'Pago Parcial' },
              { value: 'Pagada', label: 'Pagada' },
              { value: 'Anulada', label: 'Anulada' },
            ]}
          />
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {facturas.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay facturas registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Nº Factura
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Cableoperador
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Fecha Facturación
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Valor Facturado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Monto Pagado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Monto Pendiente
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.map((factura) => (
                  <tr key={factura.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {factura.Num_factura}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {typeof factura.cableoperador === 'string'
                        ? factura.cableoperador
                        : (factura.cableoperador?.nombre || factura.cableoperador?.nombre_largo || 'N/A')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatMonthYear(factura.Mes_uso)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ${formatNumber(factura.Valor_facturado_iva)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                      ${formatNumber(factura.monto_pagado)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                      ${formatNumber(factura.monto_pendiente)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(factura.estado)}`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/facturas/${factura.id}`)}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/facturas/${factura.id}/editar`)}
                        >
                          Editar
                        </Button>
                        
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
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            Primera
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={!pagination.previous}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!pagination.next}
          >
            Siguiente
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Última
          </Button>
        </div>
      )}
    </div>
  )
}

export default FacturasList
