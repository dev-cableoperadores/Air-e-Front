import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { formatDate } from '../../utils/formatters'

const ProyectosDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await proyectosService.getProyectoById(id)
        setItem(data)
      } catch (err) {
        toast.error('Error al cargar proyecto')
        navigate('/proyectos')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading || !item) return <Loading fullScreen />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Proyecto {item.datos_ingreso?.OT_AIRE || item.id || ''}</h2>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => navigate(`/proyectos/${item.datos_ingreso?.OT_AIRE || item.id}/editar`)}>Editar</Button>
          <Button variant="outline" onClick={() => navigate('/proyectos')}>Volver</Button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 space-y-3">
        <p><strong>Ingreso (OT_AIRE):</strong> {item.datos_ingreso?.OT_AIRE}</p>
        <p><strong>Nombre proyecto:</strong> {item.datos_ingreso?.nombre}</p>
        <p><strong>Inspector responsable:</strong> {item.inspector_responsable?.user.username || item.inspector_responsable}</p>
        <p><strong>Fecha inspección:</strong> {item.fecha_inspeccion ? formatDate(item.fecha_inspeccion) : ''}</p>
        <p><strong>Fecha análisis inspección:</strong> {item.fecha_analisis_inspeccion ? formatDate(item.fecha_analisis_inspeccion) : ''}</p>
        <p><strong>Estado inicial:</strong> {item.estado_inicial === 'gestionar_escritorio' ? 'Gestion desde Escritorio' : 'Gestion en sitio'}</p>
        <p><strong>Fecha de entrega:</strong> {item.fecha_entrega_pj ? formatDate(item.fecha_entrega_pj) : ''}</p>
        <p><strong>Fecha de notificacion a PRST:</strong> {item.fecha_notificacion_prst ? formatDate(item.fecha_notificacion_prst) : ''}</p>
        <p><strong>Estado actual:</strong> {item.estado_actual}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">Cables</h4>
            <pre className="text-sm">{JSON.stringify(item.cable || {}, null, 2)}</pre>
          </div>
          <div>
            <h4 className="font-semibold">Caja Empalme</h4>
            <pre className="text-sm">{JSON.stringify(item.caja_empalme || {}, null, 2)}</pre>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <h4 className="font-semibold">Altura Final Poste</h4>
            <pre className="text-sm">{JSON.stringify(item.altura_final_poste || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProyectosDetail
