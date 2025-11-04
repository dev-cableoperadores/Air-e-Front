import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { ESTADOS_CONTRATO } from '../../utils/constants'
import { formatDateForInput } from '../../utils/formatters'

const ContratosEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cableoperadores, setCableoperadores] = useState([])
  const [formData, setFormData] = useState({
    cableoperador: '',
    estado_contrato: 'Vigente',
    duracion_anos: '',
    inicio_vigencia: '',
    fin_vigencia: '',
    valor_contrato: '',
    fecha_radicacion: '',
    tipo_fecha_radicacion: 'fija',
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [contratoData, cableoperadoresData] = await Promise.all([
        contratosService.getById(id),
        // Obtener todos los cable-operadores para el select
        cableoperadoresService.getAllAllPages(),
      ])
      
      const items = Array.isArray(cableoperadoresData?.results) ? cableoperadoresData.results : (cableoperadoresData || [])
      setCableoperadores(items)
      setFormData({
        ...contratoData,
        cableoperador: contratoData.cableoperador?.toString() || '',
        duracion_anos: contratoData.duracion_anos?.toString() || '',
        valor_contrato: contratoData.valor_contrato?.toString() || '',
        fecha_radicacion: contratoData.fecha_radicacion?.toString() || '',
        inicio_vigencia: formatDateForInput(contratoData.inicio_vigencia),
        fin_vigencia: formatDateForInput(contratoData.fin_vigencia),
      })
    } catch (error) {
      toast.error('Error al cargar contrato')
      navigate('/contratos')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.cableoperador || !formData.inicio_vigencia || !formData.fin_vigencia) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    if (new Date(formData.fin_vigencia) <= new Date(formData.inicio_vigencia)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio')
      return
    }

    setSaving(true)

    try {
      const dataToSend = {
        ...formData,
        cableoperador: parseInt(formData.cableoperador),
        duracion_anos: formData.duracion_anos ? parseInt(formData.duracion_anos) : 0,
        valor_contrato: formData.valor_contrato ? parseFloat(formData.valor_contrato) : 0,
        fecha_radicacion: formData.fecha_radicacion ? parseInt(formData.fecha_radicacion) : 0,
      }

      await contratosService.update(id, dataToSend)
      toast.success('Contrato actualizado exitosamente')
      navigate('/contratos')
    } catch (error) {
      toast.error('Error al actualizar contrato')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Contrato</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Cable-operador"
            name="cableoperador"
            value={formData.cableoperador}
            onChange={handleChange}
            options={cableoperadores.map((co) => ({
              value: co.id.toString(),
              label: co.nombre,
            }))}
            required
          />
          <Select
            label="Estado del Contrato"
            name="estado_contrato"
            value={formData.estado_contrato}
            onChange={handleChange}
            options={ESTADOS_CONTRATO}
            required
          />
          <Input
            label="Duración en Años"
            name="duracion_anos"
            type="number"
            value={formData.duracion_anos}
            onChange={handleChange}
          />
          <Input
            label="Fecha de Inicio"
            name="inicio_vigencia"
            type="date"
            value={formData.inicio_vigencia}
            onChange={handleChange}
            required
          />
          <Input
            label="Fecha de Fin"
            name="fin_vigencia"
            type="date"
            value={formData.fin_vigencia}
            onChange={handleChange}
            required
          />
          <Input
            label="Valor del Contrato"
            name="valor_contrato"
            type="number"
            step="0.01"
            value={formData.valor_contrato}
            onChange={handleChange}
          />
          <Input
            label="Fecha de Radicación"
            name="fecha_radicacion"
            type="number"
            value={formData.fecha_radicacion}
            onChange={handleChange}
            required
          />
          <Select
            label="Tipo de Fecha de Radicación"
            name="tipo_fecha_radicacion"
            value={formData.tipo_fecha_radicacion}
            onChange={handleChange}
            options={[
              { value: 'fija', label: 'Fija' },
              { value: 'dinamica', label: 'Dinámica' },
            ]}
            required
          />
        </div>
        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Actualizar Contrato'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/contratos')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ContratosEdit

