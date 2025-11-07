import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { ChevronDown } from 'lucide-react'
import { ESTADOS_CONTRATO,VIGENCIA_AMPARO_POLIZA, MONTO_ASEGURADO_POLIZA_RCE, MONTO_ASEGURADO_POLIZA_CUMPLIMIENTO  } from '../../utils/constants'
import { formatDateForInput } from '../../utils/formatters'

const ContratosEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cableoperadores, setCableoperadores] = useState([])
  const [openSections, setOpenSections] = useState({
    nap: false,
    cable: false,
    caja_empalme: false,
    reserva: false,
  })
  const [formData, setFormData] = useState({
    cableoperador: '',
    estado_contrato: 'Vigente',
    duracion_anos: '',
    inicio_vigencia: '',
    fin_vigencia: '',
    valor_contrato: '',
    fecha_radicacion: '',
    tipo_fecha_radicacion: 'fija',
    // Campos anidados
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
    loadData()
  }, [id])

    const loadData = async () => {
    try {
      setLoading(true)
      const [contratoData, cableoperadoresData] = await Promise.all([
        contratosService.getById(id),
        cableoperadoresService.getAllAllPages(),
      ])
      
      //console.log('Datos del contrato cargado:', contratoData)
      
      const items = Array.isArray(cableoperadoresData?.results) 
        ? cableoperadoresData.results 
        : (cableoperadoresData || [])
      
      setCableoperadores(items)

      // Asegurarnos de que tenemos los datos del contrato
      if (!contratoData) {
        throw new Error('No se pudo cargar el contrato')
      }

      setFormData({
        ...contratoData,
        // Usar el ID del cableoperador para el select (probar ambas estructuras)
        cableoperador: contratoData.cableoperador?.id?.toString() || contratoData.cableoperador?.toString() || '',
        duracion_anos: contratoData.duracion_anos?.toString() || '',
        valor_contrato: contratoData.valor_contrato?.toString() || '',
        fecha_radicacion: contratoData.fecha_radicacion?.toString() || '',
        inicio_vigencia: formatDateForInput(contratoData.inicio_vigencia),
        fin_vigencia: formatDateForInput(contratoData.fin_vigencia),
        tipo_fecha_radicacion: contratoData.tipo_fecha_radicacion || 'fija',
        // Rellenar campos anidados
        nap: {
          tip8: contratoData.nap?.tip8?.toString() || '',
          tip10: contratoData.nap?.tip10?.toString() || '',
          tip12: contratoData.nap?.tip12?.toString() || '',
          tip14: contratoData.nap?.tip14?.toString() || '',
          tip15: contratoData.nap?.tip15?.toString() || '',
          tip16: contratoData.nap?.tip16?.toString() || '',
          tip20: contratoData.nap?.tip20?.toString() || '',
        },
        cable: {
          tipo8: contratoData.cable?.tipo8?.toString() || '',
          tipo10: contratoData.cable?.tipo10?.toString() || '',
          tipo12: contratoData.cable?.tipo12?.toString() || '',
          tipo14: contratoData.cable?.tipo14?.toString() || '',
          tipo15: contratoData.cable?.tipo15?.toString() || '',
          tipo16: contratoData.cable?.tipo16?.toString() || '',
          tipo20: contratoData.cable?.tipo20?.toString() || '',
        },
        caja_empalme: {
          tipo8: contratoData.caja_empalme?.tipo8?.toString() || '',
          tipo10: contratoData.caja_empalme?.tipo10?.toString() || '',
          tipo12: contratoData.caja_empalme?.tipo12?.toString() || '',
          tipo14: contratoData.caja_empalme?.tipo14?.toString() || '',
          tipo15: contratoData.caja_empalme?.tipo15?.toString() || '',
          tipo16: contratoData.caja_empalme?.tipo16?.toString() || '',
          tipo20: contratoData.caja_empalme?.tipo20?.toString() || '',
        },
        reserva: {
          tipo8: contratoData.reserva?.tipo8?.toString() || '',
          tipo10: contratoData.reserva?.tipo10?.toString() || '',
          tipo12: contratoData.reserva?.tipo12?.toString() || '',
          tipo14: contratoData.reserva?.tipo14?.toString() || '',
          tipo15: contratoData.reserva?.tipo15?.toString() || '',
          tipo16: contratoData.reserva?.tipo16?.toString() || '',
          tipo20: contratoData.reserva?.tipo20?.toString() || '',
        },
      })
    } catch (error) {
      //console.error('Error al cargar contrato:', error)
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

  const handleNestedChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...(formData[section] || {}),
        [field]: value,
      },
    })
  }

  // Lógica para determinar el estado del contrato y calcular fin_vigencia automáticamente
  const determinarEstado = useCallback((inicio, fin) => {
    const hoy = new Date()
    const hoyString = hoy.toISOString().split('T')[0]
    const fechaActual = new Date(hoyString + 'T00:00:00')

    const fechaInicio = inicio ? new Date(inicio + 'T00:00:00') : null
    const fechaFin = fin ? new Date(fin + 'T00:00:00') : null

    if (!fechaInicio || !fechaFin) return ''

    // Si la fecha de inicio es futura, consideramos 'Vigente' (o ajustar a 'Pendiente' si aplica)
    if (fechaInicio > fechaActual) return 'Vigente'

    if (fechaActual < fechaFin) return 'Vigente'

    return 'Vencido'
  }, [])

  useEffect(() => {
    const inicioVigencia = formData.inicio_vigencia
    const duracionAnos = Number(formData.duracion_anos)

    if (inicioVigencia && !isNaN(duracionAnos) && duracionAnos >= 0) {
      const fechaInicio = new Date(inicioVigencia + 'T00:00:00')
      if (!isNaN(fechaInicio.getTime())) {
        const fechaFin = new Date(fechaInicio)
        fechaFin.setFullYear(fechaFin.getFullYear() + duracionAnos)

        const year = fechaFin.getFullYear()
        const month = String(fechaFin.getMonth() + 1).padStart(2, '0')
        const day = String(fechaFin.getDate()).padStart(2, '0')
        const finVigenciaCalculada = `${year}-${month}-${day}`

        if (formData.fin_vigencia !== finVigenciaCalculada) {
          setFormData(prevData => ({ ...prevData, fin_vigencia: finVigenciaCalculada }))
        }
      }
    }

    const nuevoEstado = determinarEstado(formData.inicio_vigencia, formData.fin_vigencia)
    if (formData.estado_contrato !== nuevoEstado) {
      setFormData(prevData => ({ ...prevData, estado_contrato: nuevoEstado }))
    }
  }, [formData.inicio_vigencia, formData.fin_vigencia, formData.duracion_anos, formData.estado_contrato, determinarEstado])

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
        ...formData,
        cableoperador_id: parseInt(formData.cableoperador),
        duracion_anos: formData.duracion_anos ? parseInt(formData.duracion_anos) : 0,
        valor_contrato: formData.valor_contrato ? parseFloat(formData.valor_contrato) : 0,
        fecha_radicacion: formData.fecha_radicacion ? parseInt(formData.fecha_radicacion) : 0,
        ...nestedPayload,
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

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
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
            label="Cableoperador"
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
          <Input
            label="Tomador"
            name="tomador"
            type="text"
            value={formData.tomador}
            onChange={handleChange}
          />
          <Input
            label="Aseguradora"
            name="aseguradora"
            type="text"
            value={formData.aseguradora}
            onChange={handleChange}
          />
          <Input
            label="Fecha preliquidacion"
            name="fecha_preliquidacion"
            type="date"
            value={formData.fecha_preliquidacion}
            onChange={handleChange}
          />
        </div>
        {/*Secciones de la poliza*/}
        <h3 className="text-lg font-semibold">Campos de la Póliza de cumplimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos de la póliza de cumplimiento */}
          <Input
            label="Número de poliza de cumplimiento"
            name="numero_poliza_cumplimiento"
            type="number"
            step="0.01"
            value={formData.numero_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Inicio de vigencia de poliza de cumplimiento"
            name="inicio_vigencia_poliza_cumplimiento"
            type="date"
            value={formData.inicio_vigencia_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Fin de vigencia de poliza de cumplimiento"
            name="fin_vigencia_poliza_cumplimiento"
            type="date"
            value={formData.fin_vigencia_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Select
            label="Vigencia de amparo de la póliza"
            name="vigencia_amparo_poliza_cumplimiento"
            value={formData.vigencia_amparo_poliza_cumplimiento}
            onChange={handleChange}
            options={VIGENCIA_AMPARO_POLIZA}
          />
          <Input
            label="Inicio de vigencia de amparo de la póliza"
            name="inicio_vigencia_amparo_poliza_cumplimiento"
            type="date"
            value={formData.inicio_vigencia_amparo_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Fin de vigencia de amparo de la póliza"
            name="fin_vigencia_amparo_poliza_cumplimiento"
            type="date"
            value={formData.fin_vigencia_amparo_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Select
            label="Monto asegurado de la póliza"
            name="monto_asegurado_poliza_cumplimiento"
            value={formData.monto_asegurado_poliza_cumplimiento}
            onChange={handleChange}
            options={MONTO_ASEGURADO_POLIZA_CUMPLIMIENTO}
          />
          <Input
            label="Valor Monto asegurado de la póliza"
            name="valor_monto_asegurado_poliza_cumplimiento"
            type="number"
            step="0.01"
            value={formData.valor_monto_asegurado_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Valor asegurado de la póliza"
            name="valor_asegurado_poliza_cumplimiento"
            type="number"
            step="0.01"
            value={formData.valor_asegurado_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Inicio amparo de la póliza"
            name="inicio_amparo_poliza_cumplimiento"
            type="date"
            value={formData.inicio_amparo_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Fin amparo de la póliza"
            name="fin_amparo_poliza_cumplimiento"
            type="date"
            value={formData.fin_amparo_poliza_cumplimiento}
            onChange={handleChange}
          />
          <Input
            label="Expedicion de la póliza"
            name="expedicion_poliza_cumplimiento"
            type="date"
            value={formData.expedicion_poliza_cumplimiento}
            onChange={handleChange}
          />
        </div>
        <h3 className="text-lg font-semibold">Campos de la Póliza de RCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos de la póliza de RCE */}
          <Input
            label="Número de poliza de RCE"
            name="numero_poliza_rce"
            type="number"
            step="0.01"
            value={formData.numero_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Inicio de vigencia de poliza de rce"
            name="inicio_vigencia_poliza_rce"
            type="date"
            value={formData.inicio_vigencia_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Fin de vigencia de poliza de rce"
            name="fin_vigencia_poliza_rce"
            type="date"
            value={formData.fin_vigencia_poliza_rce}
            onChange={handleChange}
          />
          <Select
            label="Vigencia de amparo de la rce"
            name="vigencia_amparo_poliza_rce"
            value={formData.vigencia_amparo_poliza_rce}
            onChange={handleChange}
            options={VIGENCIA_AMPARO_POLIZA}
          />
          <Input
            label="Inicio de vigencia de amparo de la póliza"
            name="inicio_vigencia_amparo_poliza_rce"
            type="date"
            value={formData.inicio_vigencia_amparo_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Fin de vigencia de amparo de la póliza"
            name="fin_vigencia_amparo_poliza_rce"
            type="date"
            value={formData.fin_vigencia_amparo_poliza_rce}
            onChange={handleChange}
          />
          <Select
            label="Monto asegurado de la póliza"
            name="monto_asegurado_poliza_rce"
            value={formData.monto_asegurado_poliza_rce}
            onChange={handleChange}
            options={MONTO_ASEGURADO_POLIZA_RCE}
          />
          <Input
            label="Valor Monto asegurado de la póliza"
            name="valor_monto_asegurado_poliza_rce"
            type="number"
            step="0.01"
            value={formData.valor_monto_asegurado_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Valor asegurado de la rce"
            name="valor_asegurado_poliza_rce"
            type="number"
            step="0.01"
            value={formData.valor_asegurado_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Inicio amparo de la póliza"
            name="inicio_amparo_poliza_rce"
            type="date"
            value={formData.inicio_amparo_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Fin amparo de la póliza"
            name="fin_amparo_poliza_rce"
            type="date"
            value={formData.fin_amparo_poliza_rce}
            onChange={handleChange}
          />
          <Input
            label="Expedicion de la póliza"
            name="expedicion_poliza_rce"
            type="date"
            value={formData.expedicion_poliza_rce}
            onChange={handleChange}
          />
        </div>
        {/* Secciones anidadas: Nap, Cable, Caja Empalme, Reserva */}
        <h3 className="text-lg font-semibold">Seccion de Usos</h3>
        <div className="space-y-2">
          {['nap', 'cable', 'caja_empalme', 'reserva'].map((section) => (
            <div key={section} className="border rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection(section)}
                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100"
              >
                <h3 className="text-lg font-semibold capitalize">{section.replace('_', ' ')}</h3>
                <ChevronDown
                  className={`transform transition-transform ${
                    openSections[section] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSections[section] && (
                <div className="p-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'tip8',
                      'tip10',
                      'tip12',
                      'tip14',
                      'tip15',
                      'tip16',
                      'tip20',
                    ].map((key) => (
                      <Input
                        key={key}
                        label={key}
                        name={key}
                        type="number"
                        value={formData[section][key]}
                        onChange={(e) =>
                          handleNestedChange(section, key, e.target.value)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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
