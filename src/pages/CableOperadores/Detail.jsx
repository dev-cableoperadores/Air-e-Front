import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import cableoperadoresService from '../../services/cableoperadoresService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import { formatPhone, formatNumber, formatDate } from '../../utils/formatters'
import { TIPO_CHOICES } from '../../utils/constants'

const CableOperadoresDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cableoperador, setCableoperador] = useState(null)
  const [notificaciones, setNotificaciones] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })

  useEffect(() => {
    loadCableoperador()
  }, [id])

  const loadCableoperador = async () => {
    try {
      setLoading(true)
      const data = await cableoperadoresService.getById(id)
      setCableoperador(data)
    } catch (error) {
      toast.error('Error al cargar cableoperador')
      navigate('/cableoperadores')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar ${cableoperador?.nombre}?`)) {
      try {
        await cableoperadoresService.delete(id)
        toast.success('Cableoperador eliminado')
        navigate('/cableoperadores')
      } catch (error) {
        toast.error('Error al eliminar cableoperador')
      }
    }
  }
  // Cargar notificaciones
  useEffect(() => {
    const loadNotificaciones = async () => {
      try {
        const responseData = await cableoperadoresService.getNotificaciones(id)
        
        // CORRECCIÓN: Usar responseData.results
        setNotificaciones(responseData) 
        
      } catch (error) {
        toast.error('Error al cargar notificaciones')
      }
    }

    loadNotificaciones()
  }, [id])

  if (loading) {
    return <Loading fullScreen />
  }

  if (!cableoperador) {
    return <div>Cableoperador no encontrado</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalle Cableoperador</h2>
        <div className="flex gap-2">
          <Link to={`/cableoperadores/${id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
          <Link to="/cableoperadores">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="bg-secondary text-white rounded-lg p-4 mb-6">
          <h3 className="text-2xl font-bold text-center">{cableoperador.nombre_largo}</h3>
          {cableoperador.nombre && (
            <p className="text-center mt-2 opacity-90">{cableoperador.nombre}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="NIT" value={cableoperador.NIT + ' - ' + cableoperador.Digito_verificacion || 'N/A'} />
          <DetailField label="Registro TIC" value={cableoperador.RegistroTic || 'N/A'} />
          <DetailField label="Código Interno" value={cableoperador.CodigoInterno || 'N/A'} />
          <DetailField label="País" value={cableoperador.pais || 'N/A'} />
          <DetailField label="Ciudad" value={cableoperador.ciudad || 'N/A'} />
          <DetailField label="Departamento" value={cableoperador.departamento || 'N/A'}  />
          <DetailField label="Dirección" value={cableoperador.direccion || 'N/A'}  />
          <DetailField label="Representante" value={cableoperador.Representante || 'N/A'} />
          <DetailField label="Teléfono" value={cableoperador.telefono ? formatPhone(cableoperador.telefono) : 'N/A'} />
          <DetailField label="Correo" value={cableoperador.correo || 'N/A'} />
          <DetailField label="Estado" value={cableoperador.estado || 'N/A'} />
          <DetailField label="Vencimiento Factura" value={cableoperador.vencimiento_factura || 'N/A'} />
          <DetailField label="Preliquidación Número" value={cableoperador.preliquidacion_num || 'N/A'} />
          <DetailField label="Preliquidación Letra" value={cableoperador.preliquidacion_letra || 'N/A'} />
          <DetailField label="Respuesta Preliquidación" value={cableoperador.respuesta_preliquidacion || 'N/A'} />
          <DetailField label="Ejecutiva" value={cableoperador.ejecutiva?.first_name + ' ' + cableoperador.ejecutiva?.last_name || 'N/A'} />
          <DetailField label="Observaciones" value={cableoperador.observaciones || 'N/A'} />
        </div>
      </div>
      <br />
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
    {/* Formulario para agregar notificación */}
    <div className="border-b pb-4 mb-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Nueva Notificación</h3>
      <form onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const notificacionData = {
          tipo_notificacion: formData.get('tipo_notificacion'),
          fecha: formData.get('fecha'),
          cableoperador: Number(id), // enviar entero (por compatibilidad)
          cableoperador_id: Number(id), // algunos endpoints esperan este campo
        };
        
        try {
          await cableoperadoresService.postNotificaciones(id, notificacionData);
          toast.success('Notificación creada exitosamente');
          // Recargar notificaciones
          const responseData = await cableoperadoresService.getNotificaciones(id);
          setNotificaciones(responseData);
          e.target.reset();
        } catch (error) {
            // Mostrar detalles del error para depuración
            const resp = error?.response;
            console.error('Error creando notificación', resp || error);
            const serverData = resp?.data;
            // Intentar mostrar mensaje humano legible si viene en formato { field: [..] }
            let message = 'Error al crear la notificación';
            if (serverData) {
              if (typeof serverData === 'string') {
                message = serverData;
              } else if (serverData.detail) {
                message = serverData.detail;
              } else {
                // Construir mensaje a partir de validaciones
                try {
                  const parts = [];
                  for (const [k, v] of Object.entries(serverData)) {
                    parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
                  }
                  if (parts.length) message = parts.join(' | ');
                } catch (e) {
                  message = JSON.stringify(serverData);
                }
              }
            }

            toast.error(message);
        }
      }} className="space-y-4">
        <div>
          <select 
            name="tipo_notificacion" 
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Seleccione tipo de notificación</option>
            {TIPO_CHOICES.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            name="fecha"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>
        <Button type="submit" className="w-full">
          Agregar Notificación
        </Button>
      </form>
    </div>

    {/* Lista de notificaciones */}
    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Historial de Notificaciones ({notificaciones.count})</h3>
    {notificaciones.count === 0 ? (
      <p className="text-gray-500">No hay notificaciones registradas para este cableoperador.</p>
    ) : (
      <div className="space-y-4">
          {notificaciones.results.map(notificacion => (
            <div key={notificacion.id} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <p className="text-lg font-semibold text-primary">
                  {TIPO_CHOICES.find(tipo => tipo.value === notificacion.tipo_notificacion)?.label || notificacion.tipo_notificacion}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fecha de notificación: {formatDate(notificacion.fecha)}
              </p>
            </div>
          ))}
        </div>
    )}
  </div>
</div>
  )
}

const DetailField = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
    <p className="text-base text-gray-900">{value}</p>
  </div>
)

export default CableOperadoresDetail

