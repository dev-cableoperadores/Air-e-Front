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
      const data = await cableoperadoresService.getAllFull()
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Nuevo Ingreso de Proyecto</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="rechazado_GD" checked={formData.rechazado_GD} onChange={handleCheckboxChange} />
              <span>Rechazado GD</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="cancelado" checked={formData.cancelado} onChange={handleCheckboxChange} />
              <span>Cancelado</span>
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="incluir_contrato" checked={formData.incluir_contrato} onChange={handleCheckboxChange} />
              <span>Incluir en Contrato</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="negado" checked={formData.negado} onChange={handleCheckboxChange} />
              <span>Negado</span>
            </label>
          </div>
          <Select label="Tipo Ingreso" name="TipoIngreso" value={formData.TipoIngreso} onChange={handleChange} options={[{value:'Viabilidad',label:'Viabilidad'},{value:'Instalacion',label:'Instalación'},{value:'Otro',label:'Otro'}]} />
          <Select label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} options={departamentosOptions} />
          <Input label="Municipio" name="municipio" value={formData.municipio} onChange={handleChange} />
          <Input label="Barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
          <Input label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} />
          <Input label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} />
          <Input label="Fecha Confirmación Fin" name="fecha_confirmacion_fin" type="date" value={formData.fecha_confirmacion_fin} onChange={handleChange} />
          <Input label="Fecha Radicación PRST" name="fecha_radicacion_prst" type="date" value={formData.fecha_radicacion_prst} onChange={handleChange} />
          <Input label="Fecha Revisión Documento" name="fecha_revision_doc" type="date" value={formData.fecha_revision_doc} onChange={handleChange} />
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Altura Inicial Poste (opcional)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.keys(formData.altura_inicial_poste_input).map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.altura_inicial_poste_input[k]} onChange={handleAlturaChange} />
            ))}
          </div>
        </div>

        <div>
          <Input label="Observaciones" name="observaciones" value={formData.observaciones} onChange={handleChange} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/proyectos/ingreso')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

export default IngresoNew
