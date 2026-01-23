import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import { formatDate } from '../../utils/formatters'

const IngresoDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await proyectosService.getIngresoById(id)
        setItem(data)
      } catch (error) {
        toast.error('Error al cargar ingreso')
        navigate('/proyectos/ingreso')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Eliminar ingreso?')) return
    try {
      await proyectosService.deleteIngreso(id)
      toast.success('Ingreso eliminado')
      navigate('/proyectos/ingreso')
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <Loading fullScreen />
  if (!item) return <div>Ingreso no encontrado</div>

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Ingreso {item.OT_AIRE}</h2>
        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
          <Link to={`/proyectos/ingreso/${id}/editar`} className="w-full sm:w-auto"><Button variant="secondary" className="w-full text-xs sm:text-sm">Editar</Button></Link>
          <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto text-xs sm:text-sm">Eliminar</Button>
          <Link to="/proyectos/ingreso" className="w-full sm:w-auto"><Button variant="outline" className="w-full text-xs sm:text-sm">Volver</Button></Link>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 mx-2 sm:mx-0">
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Nombre:</strong> <span className="text-gray-600 dark:text-gray-400">{item.nombre}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Cableoperador:</strong> <span className="text-gray-600 dark:text-gray-400">{item.cableoperador?.nombre || 'N/A'}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Departamento:</strong> <span className="text-gray-600 dark:text-gray-400">{item.departamento}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Estado Ingreso:</strong> <span className="text-gray-600 dark:text-gray-400">{item.estado_ingreso}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Fecha inicio:</strong> <span className="text-gray-600 dark:text-gray-400">{formatDate(item.fecha_inicio)}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Fecha fin:</strong> <span className="text-gray-600 dark:text-gray-400">{formatDate(item.fecha_fin)}</span></p>
        <div className="pt-2 sm:pt-3">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-3">Altura Inicial Poste</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {item.altura_inicial_poste && Object.entries(item.altura_inicial_poste).map(([k,v]) => {
              const textoDescriptivo = `Altura ${k.replace('tipo', '')}m`;
              return (
                <div key={k} className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded border border-blue-200 dark:border-blue-700">
                  <p className="text-xs sm:text-xs text-gray-600 dark:text-gray-400">{textoDescriptivo}</p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">{v}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="pt-2 sm:pt-3">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-2">Observaciones</h3>
          <p className="text-xs sm:text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400">{item.observaciones || '-'}</p>
        </div>
      </div>
    </div>
  )
}

export default IngresoDetail
