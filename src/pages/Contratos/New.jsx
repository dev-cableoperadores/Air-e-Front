import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { ESTADOS_CONTRATO } from '../../utils/constants'

const ContratosNew = () => {
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
    // Campos anidados por defecto
    nap: {
      tip8: '',
      tip10: '',
      tip12: '',
      tip14: '',
      tip15: '',
      tip16: '',
      tip20: '',
    },
    cable: {
      tipo8: '',
      tipo10: '',
      tipo12: '',
      tipo14: '',
      tipo15: '',
      tipo16: '',
      tipo20: '',
    },
    caja_empalme: {
      tipo8: '',
      tipo10: '',
      tipo12: '',
      tipo14: '',
      tipo15: '',
      tipo16: '',
      tipo20: '',
    },
    reserva: {
      tipo8: '',
      tipo10: '',
      tipo12: '',
      tipo14: '',
      tipo15: '',
      tipo16: '',
      tipo20: '',
    },
  })

  useEffect(() => {
    loadCableoperadores()
  }, [])

  const loadCableoperadores = async () => {
    try {
      // Traer todos los cable-operadores (todas las páginas) para el select
      const data = await cableoperadoresService.getAllAllPages()
      const items = Array.isArray(data?.results) ? data.results : (data || [])
      setCableoperadores(items)
    } catch (error) {
      toast.error('Error al cargar cableoperadores')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNestedChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...(formData[section] || {}),
        [field]: value,
      },
    })
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
      // Normalizar campos numéricos anidados (string -> int)
      const normalizeNumbers = (obj, defaults = {}) => {
        const out = {}
        for (const k in obj) {
          const v = obj[k]
          out[k] = v === '' || v === null || v === undefined ? (defaults[k] || 0) : parseInt(v)
        }
        return out
      }

      const nestedPayload = {
        nap: normalizeNumbers(formData.nap),
        cable: normalizeNumbers(formData.cable),
        caja_empalme: normalizeNumbers(formData.caja_empalme),
        reserva: normalizeNumbers(formData.reserva),
      }

      const dataToSend = {
        // Campos principales (fechas/strings)
        ...formData,
        cableoperador_id: parseInt(formData.cableoperador),
        duracion_anos: formData.duracion_anos ? parseInt(formData.duracion_anos) : 0,
        valor_contrato: formData.valor_contrato ? parseFloat(formData.valor_contrato) : 0,
        fecha_radicacion: formData.fecha_radicacion ? parseInt(formData.fecha_radicacion) : 0,
        // Reemplazar objetos anidados por versiones normalizadas
        ...nestedPayload,
      }

      await contratosService.create(dataToSend)
      toast.success('Contrato creado exitosamente')
      navigate('/contratos')
    } catch (error) {
      toast.error('Error al crear contrato')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Contrato</h2>
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

        {/* Secciones anidadas: Nap, Cable, Caja Empalme, Reserva */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">NAP</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['tip8','tip10','tip12','tip14','tip15','tip16','tip20'].map((key) => (
              <Input
                key={key}
                label={key}
                name={key}
                type="number"
                value={formData.nap[key]}
                onChange={(e) => handleNestedChange('nap', key, e.target.value)}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold">Cable</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((key) => (
              <Input
                key={key}
                label={key}
                name={key}
                type="number"
                value={formData.cable[key]}
                onChange={(e) => handleNestedChange('cable', key, e.target.value)}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold">Caja Empalme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((key) => (
              <Input
                key={key}
                label={key}
                name={key}
                type="number"
                value={formData.caja_empalme[key]}
                onChange={(e) => handleNestedChange('caja_empalme', key, e.target.value)}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold">Reserva</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((key) => (
              <Input
                key={key}
                label={key}
                name={key}
                type="number"
                value={formData.reserva[key]}
                onChange={(e) => handleNestedChange('reserva', key, e.target.value)}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear Contrato'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/contratos')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ContratosNew

