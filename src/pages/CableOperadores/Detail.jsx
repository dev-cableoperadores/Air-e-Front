import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import cableoperadoresService from '../../services/cableoperadoresService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import { formatPhone, formatNumber, formatDate } from '../../utils/formatters'

const CableOperadoresDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [cableoperador, setCableoperador] = useState(null)

  useEffect(() => {
    loadCableoperador()
  }, [id])

  const loadCableoperador = async () => {
    try {
      setLoading(true)
      const data = await cableoperadoresService.getById(id)
      setCableoperador(data)
    } catch (error) {
      toast.error('Error al cargar cable-operador')
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

  if (loading) {
    return <Loading fullScreen />
  }

  if (!cableoperador) {
    return <div>Cable-operador no encontrado</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalle Cable-operador</h2>
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
          <DetailField label="NIT" value={cableoperador.NIT ? formatNumber(cableoperador.NIT) : 'N/A'} />
          <DetailField label="Dígito de Verificación" value={cableoperador.Digito_verificacion || 'N/A'} />
          <DetailField label="Registro TIC" value={cableoperador.RegistroTic || 'N/A'} />
          <DetailField label="Código Interno" value={cableoperador.CodigoInterno || 'N/A'} />
          <DetailField label="País" value={cableoperador.pais || 'N/A'} />
          <DetailField label="Ciudad" value={cableoperador.ciudad || 'N/A'} />
          <DetailField label="Dirección" value={cableoperador.direccion || 'N/A'} className="md:col-span-2" />
          <DetailField label="Departamento" value={cableoperador.departamento || 'N/A'} className="md:col-span-2" />
          <DetailField label="Representante" value={cableoperador.Representante || 'N/A'} />
          <DetailField label="Teléfono" value={cableoperador.telefono ? formatPhone(cableoperador.telefono) : 'N/A'} />
          <DetailField label="Correo" value={cableoperador.correo || 'N/A'} />
          <DetailField label="Estado" value={cableoperador.estado || 'N/A'} />
          <DetailField label="Vencimiento Factura" value={cableoperador.vencimiento_factura || 'N/A'} />
          <DetailField label="Preliquidación Número" value={cableoperador.preliquidacion_num || 'N/A'} />
          <DetailField label="Preliquidación Letra" value={cableoperador.preliquidacion_letra || 'N/A'} />
          <DetailField label="Respuesta Preliquidación" value={cableoperador.respuesta_preliquidacion || 'N/A'} />
          <DetailField label="Observaciones" value={cableoperador.observaciones || 'N/A'} className="md:col-span-2" />
          <DetailField label="Ejecutiva" value={cableoperador.ejecutiva?.first_name + ' ' + cableoperador.ejecutiva?.last_name || 'N/A'} className="md:col-span-2" />
        </div>
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

