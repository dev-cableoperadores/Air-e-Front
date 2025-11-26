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
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 text-2xl font-bold text-gray-800">Ingresos de Proyecto</h1>
          <p className="text-2xl md:text-1xl font-bold text-gray-900 dark:text-gray-100 text-1xl font-bold text-gray-800">Gestión de ingresos (viabilidad)</p>
        </div>
        <Link to="/proyectos/ingreso/nuevo">
          <Button variant="primary">Nuevo Ingreso</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por OT_AIRE, nombre o departamento"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput) }}
            className="w-full border rounded px-3 py-2"
          />
          <Button onClick={() => setSearchTerm(searchInput)}>Buscar</Button>
          <Button variant="outline" onClick={() => { setSearchInput(''); setSearchTerm('') }}>Limpiar</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay ingresos registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">OT_AIRE</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Cableoperador</th>
                  <th className="px-4 py-2 text-left">Departamento</th>
                  <th className="px-4 py-2 text-left">Fecha Inicio</th>
                  <th className="px-4 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.OT_AIRE} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-semibold">{it.OT_AIRE}</td>
                    <td className="px-4 py-3 text-sm">{it.nombre}</td>
                    <td className="px-4 py-3 text-sm">{it.cableoperador?.nombre || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{it.departamento}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(it.fecha_inicio)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/proyectos/ingreso/${it.OT_AIRE}`)}>Ver</Button>
                        <Button size="sm" variant="primary" onClick={() => navigate(`/proyectos/ingreso/${it.OT_AIRE}/editar`)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(it.OT_AIRE, it.nombre)}>Eliminar</Button>
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
