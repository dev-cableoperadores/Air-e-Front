import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Loading from '../../components/UI/Loading'
import { formatDate, formatNumber, formatMonthYear,formatMonthYearString } from '../../utils/formatters'

const FacturasList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [facturas, setFacturas] = useState([])
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    esta_vencida: '',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const location = useLocation()

  const itemsPerPage = 10

  useEffect(() => {
    // Si la query string cambia (por ejemplo navegando desde Dashboard con ?estado=Pendiente)
    // aplicamos los filtros iniciales (estado, page) y recargamos la página correspondiente.
    const params = new URLSearchParams(location.search)
    const estadoParam = params.get('estado') || ''
    const searchParam = params.get('search') || ''
    const pageParam = parseInt(params.get('page') || '1', 10)

    // Actualizar filtros y página según la query
    setFiltros((prev) => ({ ...prev, estado: estadoParam, search: searchParam }))
    setSearchQuery(searchParam)
    setCurrentPage(isNaN(pageParam) ? 1 : pageParam)
    // loadFacturas se ejecutará por el efecto que depende de currentPage y filtros
  }, [location.search])

  useEffect(() => {
    // Cargar facturas al montar y cuando cambie la página o filtros.
    loadFacturas()
  }, [currentPage, filtros])

  const loadFacturas = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filtros.search) params.search = filtros.search
      if (filtros.estado) params.estado = filtros.estado
      if (filtros.esta_vencida !== '') params.esta_vencida = filtros.esta_vencida
      params.desplazamiento = (currentPage - 1) * itemsPerPage
      params.tamaño = itemsPerPage

      // Traer facturas filtradas desde la API
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
    if (name === 'estado') {
      setFiltros({ ...filtros, estado: value })
      setCurrentPage(1)
    }
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

  const totalPages = Math.ceil(pagination.count / itemsPerPage)
  const estavencida = (esta_vencida) => {
    if(esta_vencida == true){
      return 'Vencida'
    } else {
      return 'Vigente'
    }
  }
  const getEstaVencida = (esta_vencida) => {
    const colors = {
      true: 'text-red-600 bg-red-50',
      false: 'text-green-600 bg-green-50',
    }
    return colors[esta_vencida] || 'text-gray-600 bg-gray-50'
  }
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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Facturas</h2>
        <Button onClick={() => navigate('/facturas/nueva')} variant="primary" className="w-full sm:w-auto">
          ➕ Nueva
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Input
            label="Buscar"
            name="search"
            type="text"
            placeholder="Nº factura..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setFiltros({ ...filtros, search: searchQuery })
                setCurrentPage(1)
              }
            }}
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
          {/* NUEVO FILTRO DE VENCIMIENTO */}
          <Select
            label="Vencimiento"
            name="esta_vencida"
            value={filtros.esta_vencida}
            onChange={(e) => {
              setFiltros({ ...filtros, esta_vencida: e.target.value })
              setCurrentPage(1)
            }}
            options={[
              { value: '', label: 'Todos' },
              { value: 'true', label: 'Vencidas' },
              { value: 'false', label: 'Al día (Vigentes)' },
            ]}
          />
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {facturas.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No hay facturas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-[10px] md:text-xs divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-1 py-2 text-left font-bold text-gray-900 dark:text-gray-100 w-64 min-w-[200px]">
                    Cableoperador
                  </th>
                  <th className="px-3 px-1 sm:px-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell w-20">
                    Responsable
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell w-20">
                    Mes de Uso
                  </th>
                  <th className="px-3 px-1 sm:px-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden sm:table-cell">
                    Fecha facturación
                  </th>
                  <th className="px-3 px-1 sm:px-2 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 w-20">
                    Nº Factura
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden lg:table-cell">
                    valor pagado
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell">
                    Valor adeudado
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell">
                    Fecha vencimiento
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell">
                    Estado
                  </th>
                  <th className="px-3 sm:px-4 sm:py-3 text-left font-semibold text-gray-900 dark:text-gray-100 hidden xl:table-cell">
                    Estado Vencimiento
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {facturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-2 py-2 text-gray-700 dark:text-gray-300 font-medium break-words">
                    {typeof factura.cableoperador === 'string'
                      ? factura.cableoperador
                      : (factura.cableoperador?.nombre_largo || 'N/A')}
                  </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 text-gray-700 dark:text-gray-300 hidden sm:table-cell truncate">
                      {factura.cableoperador?.ejecutiva?.first_name}<br />
                      {factura.cableoperador?.ejecutiva?.last_name}
                    </td>
                    <td className="px-3 sm:px-4 sm:py-3 text-gray-700 dark:text-gray-300 hidden sm:table-cell truncate">
                      {formatMonthYearString(factura.Mes_uso)}
                    </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 text-gray-700 dark:text-gray-300 hidden sm:table-cell truncate">
                      {formatDate(factura.Fecha_facturacion)}
                    </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 font-semibold text-gray-900 dark:text-gray-100">
                      {factura.Num_factura}
                    </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 font-semibold text-green-600 dark:text-green-400 hidden lg:table-cell">
                      ${formatNumber(factura.monto_pagado)}
                    </td>
                    <td className="px-3 sm:px-4 sm:py-3 font-semibold text-red-600 dark:text-red-400 hidden xl:table-cell ">
                      ${formatNumber(factura.monto_pendiente)}
                    </td>
                    <td className="px-3 sm:px-4 sm:py-3 text-gray-700 dark:text-gray-300 hidden sm:table-cell truncate">
                      {formatDate(factura.Fecha_vencimiento)}
                    </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 hidden xl:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${getEstadoColor(factura.estado)} dark:bg-opacity-20`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 hidden xl:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${getEstaVencida(factura.esta_vencida)} dark:bg-opacity-20`}>
                        {estavencida(factura.esta_vencida)}
                      </span>
                    </td>
                    <td className="px-3 px-1 sm:px-2 sm:py-3 text-center">
                      <div className="flex gap-1 flex-col sm:flex-row justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/facturas/${factura.id}`)}
                          className="text-xs w-full sm:w-auto"
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate(`/facturas/${factura.id}/editar`)}
                          className="text-xs w-full sm:w-auto"
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
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="text-xs"
          >
            Primera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={!pagination.previous}
            className="text-xs"
          >
            Anterior
          </Button>
          <span className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!pagination.next}
            className="text-xs"
          >
            Siguiente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            Última
          </Button>
        </div>
      )}
    </div>
  )
}

export default FacturasList
