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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ingreso {item.OT_AIRE}</h2>
        <div className="flex gap-2">
          <Link to={`/proyectos/ingreso/${id}/editar`}><Button variant="secondary">Editar</Button></Link>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
          <Link to="/proyectos/ingreso"><Button variant="outline">Volver</Button></Link>
        </div>
      </div>

      <div className="bg-white rounded p-6 space-y-4">
        <p><strong>Nombre:</strong> {item.nombre}</p>
        <p><strong>Cableoperador:</strong> {item.cableoperador?.nombre || 'N/A'}</p>
        <p><strong>Departamento:</strong> {item.departamento}</p>
        <p><strong>Estado Ingreso:</strong> {item.estado_ingreso}</p>
        <p><strong>Fecha inicio:</strong> {formatDate(item.fecha_inicio)}</p>
        <p><strong>Fecha fin:</strong> {formatDate(item.fecha_fin)}</p>
        <div>
          <h3 className="font-semibold">Altura Inicial Poste</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {item.altura_inicial_poste && Object.entries(item.altura_inicial_poste).map(([k,v]) => {
          // 💡 Paso 1: Generar el texto descriptivo
          // k.replace('tipo', '') toma 'tipo8' y lo convierte en '8'.
          // Luego usamos un template literal (comillas inversas `) para construir el string.
          const textoDescriptivo = `Altura ${k.replace('tipo', '')}m`;
            return (
              <div key={k} className="bg-gray-50 p-2 rounded">
                {/* 🚀 Usamos la variable generada aquí */}
                <p className="text-xs text-gray-500">{textoDescriptivo}</p>
                <p className="font-semibold">{v}</p>
              </div>
            );
          })}
        </div>
        </div>
        <div>
          <h3 className="font-semibold">Observaciones</h3>
          <p className="whitespace-pre-wrap">{item.observaciones || '-'}</p>
        </div>
      </div>
    </div>
  )
}

export default IngresoDetail
