import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import { formatDate } from '../../utils/formatters'

const IngresoList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const navigate = useNavigate()

  const loadItems = useCallback(async (pageToLoad = 1, term = '') => {
    try {
      setLoading(true)
      const params = { page: pageToLoad }
      if (term) params.search = term
      const resp = await proyectosService.getIngresoAllFull(params)
      const data = resp?.results || []
      setItems(data)
      setTotalCount(resp?.count || data.length)
      console.log(resp)
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar ingresos de proyecto')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadItems(page, searchTerm)
  }, [page, searchTerm, loadItems])

  const handleDelete = async (pk, nombre) => {
    if (!window.confirm(`¿Eliminar ingreso ${nombre}?`)) return
    try {
      await proyectosService.deleteIngreso(pk)
      toast.success('Ingreso eliminado')
      loadItems(page, searchTerm)
    } catch (error) {
      toast.error('Error al eliminar ingreso')
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Ingresos de Proyecto</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Gestión de ingresos (viabilidad)</p>
        </div>
        <Link to="/proyectos/ingreso/nuevo" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto text-xs sm:text-sm">Nuevo Ingreso</Button>
        </Link>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 mx-2 sm:mx-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar por OT_AIRE, nombre o departamento"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput) }}
            className="flex-1 border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 rounded px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
          <Button onClick={() => setSearchTerm(searchInput)} className="text-xs sm:text-sm">Buscar</Button>
          <Button variant="outline" onClick={() => { setSearchInput(''); setSearchTerm('') }} className="text-xs sm:text-sm">Limpiar</Button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden mx-2 sm:mx-0">
        {items.length === 0 ? (
          <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">No hay ingresos registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-blue-100 dark:bg-blue-900/30 border-b border-blue-300 dark:border-blue-600">
                <tr>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">OT AIRE</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Nombre</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Cableoperador</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Departamento</th>
                  <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 hidden xl:table-cell">Fecha Inicio</th>
                  <th className="px-2 sm:px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.OT_AIRE} className="border-b border-blue-200 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                    <td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 font-semibold">{it.OT_AIRE}</td>
                    <td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 truncate hidden sm:table-cell">{it.nombre}</td>
                    <td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 truncate hidden md:table-cell">{it.cableoperador?.nombre || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 hidden lg:table-cell">{it.departamento}</td>
                    <td className="px-2 sm:px-4 py-2 text-gray-900 dark:text-gray-100 hidden xl:table-cell">{formatDate(it.fecha_inicio)}</td>
                    <td className="px-2 sm:px-4 py-2">
                      <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/proyectos/ingreso/${it.OT_AIRE}`)} className="text-xs">Ver</Button>
                        <Button size="sm" variant="primary" onClick={() => navigate(`/proyectos/ingreso/${it.OT_AIRE}/editar`)} className="text-xs">Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(it.OT_AIRE, it.nombre)} className="text-xs">Eliminar</Button>
                      </div>
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

export default IngresoList
