import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { formatDate } from '../../utils/formatters'
import proyectosService from '../../services/proyectosService'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'

const ProyectosList = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = await proyectosService.getProyectosListFull()
      setItems(Array.isArray(data?.results) ? data.results : (data || []))
    } catch (err) {
      toast.error('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar proyecto?')) return
    try {
      await proyectosService.deleteProyecto(id)
      toast.success('Proyecto eliminado')
      load()
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Proyectos</h2>
        <Link to="/proyectos/nuevo" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto text-xs sm:text-sm">Nuevo Proyecto</Button>
        </Link>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 overflow-x-auto mx-2 sm:mx-0">
        {items.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No hay proyectos</p>
        ) : (
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left border-b border-blue-300 dark:border-blue-600">
                <th className="py-2 px-1 sm:px-2 font-semibold text-gray-700 dark:text-gray-300">OT_AIRE</th>
                <th className="py-2 px-1 sm:px-2 font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
                <th className="py-2 px-1 sm:px-2 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                <th className="py-2 px-1 sm:px-2 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Fecha Inspección</th>
                <th className="py-2 px-1 sm:px-2 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Fecha Entrega PJ</th>
                <th className="py-2 px-1 sm:px-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.datos_ingreso.OT_AIRE} className="border-t border-blue-200 dark:border-blue-600/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <td className="py-2 px-1 sm:px-2 text-gray-900 dark:text-gray-100">{it.datos_ingreso.OT_AIRE}</td>
                  <td className="py-2 px-1 sm:px-2 text-gray-900 dark:text-gray-100 truncate">{it.datos_ingreso.nombre}</td>
                  <td className="py-2 px-1 sm:px-2 text-gray-900 dark:text-gray-100">{it.estado || it.estado_actual || ''}</td>
                  <td className="py-2 px-1 sm:px-2 text-gray-900 dark:text-gray-100 hidden sm:table-cell">{it.fecha_inspeccion ? formatDate(it.fecha_inspeccion) : ''}</td>
                  <td className="py-2 px-1 sm:px-2 text-gray-900 dark:text-gray-100 hidden md:table-cell">{it.fecha_entrega_pj ? formatDate(it.fecha_entrega_pj) : ''}</td>
                  <td className="py-2 px-1 sm:px-2">
                    <div className="flex gap-1 sm:gap-2 justify-end flex-wrap">
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/proyectos/${it.datos_ingreso.OT_AIRE}`)} className="text-xs">Ver</Button>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/proyectos/${it.datos_ingreso.OT_AIRE}/editar`)} className="text-xs">Editar</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(it.datos_ingreso.OT_AIRE)} className="text-xs">Eliminar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ProyectosList
