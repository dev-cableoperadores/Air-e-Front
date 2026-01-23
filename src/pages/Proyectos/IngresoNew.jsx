import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'

const departamentosOptions = [
  { value: 'atlantico', label: 'Atlantico' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'la_guajira', label: 'La Guajira' },
]

const IngresoNew = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cableoperadores, setCableoperadores] = useState([])
  const [formData, setFormData] = useState({
    cableoperador_id: '',
    OT_PRST: '',
    nombre: '',
    rechazado_GD: false,
    cancelado: false,
    incluir_contrato: false,
    negado: false,
    TipoIngreso: 'Viabilidad',
    departamento: 'atlantico',
    municipio: '',
    barrio: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_confirmacion_fin: '',
    fecha_radicacion_prst: '',
    fecha_revision_doc: '',
    observaciones: '',
    altura_inicial_poste_input: {
      tipo8: 0, tipo9: 0, tipo10: 0, tipo11: 0, tipo12: 0, tipo14: 0, tipo16: 0,
    }
  })

  useEffect(() => {
    loadCableoperadores()
  }, [])

  const loadCableoperadores = async () => {
    try {
      setLoading(true)
      const data = await cableoperadoresService.getAllAllPages()
      const items = Array.isArray(data?.results) ? data.results : (data || [])
      setCableoperadores(items)
    } catch (err) {
      // silent, toast optional
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAlturaChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      altura_inicial_poste_input: {
        ...formData.altura_inicial_poste_input,
        [name]: parseInt(value || 0, 10),
      }
    })
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setFormData({ ...formData, [name]: checked })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.cableoperador_id || !formData.nombre) {
      toast.error('Completa los campos requeridos')
      return
    }
    setSaving(true)
    try {
      const payload = { ...formData }

      // Normalizar: enviar null para fechas vacías (DRF requiere YYYY-MM-DD o null)
      const dateFields = ['fecha_inicio','fecha_fin','fecha_confirmacion_fin','fecha_radicacion_prst','fecha_revision_doc']
      dateFields.forEach((f) => {
        if (payload[f] === '') payload[f] = null
      })

      // Asegurar cableoperador_id como número o null
      payload.cableoperador_id = payload.cableoperador_id ? parseInt(payload.cableoperador_id, 10) : null
      await proyectosService.createIngreso(payload)
      toast.success('Ingreso creado')
      navigate('/proyectos/ingreso')
    } catch (error) {
      console.error(error)
      toast.error('Error al crear ingreso')
    } finally { setSaving(false) }
  }

  if (loading) return <Loading fullScreen />

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 px-2 sm:px-0">Nuevo Ingreso de Proyecto</h2>
      <form onSubmit={handleSubmit} className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 mx-2 sm:mx-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <SearchableSelect
            label="Cableoperador"
            name="cableoperador_id"
            value={formData.cableoperador_id} 
            onChange={handleChange}
            options={cableoperadores.map((co) => ({ value: co.id.toString(), label: co.nombre_largo || co.nombre }))}
            required
          />
          <Input label="OT PRST" name="OT_PRST" value={formData.OT_PRST} onChange={handleChange} />
          <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="rechazado_GD" checked={formData.rechazado_GD} onChange={handleCheckboxChange} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Rechazado GD</span>
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="cancelado" checked={formData.cancelado} onChange={handleCheckboxChange} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Cancelado</span>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="incluir_contrato" checked={formData.incluir_contrato} onChange={handleCheckboxChange} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Incluir en Contrato</span>
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="negado" checked={formData.negado} onChange={handleCheckboxChange} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Negado</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-3">Altura Inicial Poste (opcional)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {Object.keys(formData.altura_inicial_poste_input).map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.altura_inicial_poste_input[k]} onChange={handleAlturaChange} className="text-xs sm:text-sm" />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto text-xs sm:text-sm">{saving ? 'Guardando...' : 'Crear'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/proyectos/ingreso')} className="w-full sm:w-auto text-xs sm:text-sm">Cancelar</Button>
        </div>
      </div>
      </form>
    </div>
  )
}

export default IngresoNew
