import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import inspectoresService from '../../services/inspectoresService'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import { ESTADO_INICIAL } from '../../utils/constants'

const departamentosOptions = [
  { value: 'atlantico', label: 'Atlantico' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'la_guajira', label: 'La Guajira' },
]

const ProyectosNew = () => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ingresos, setIngresos] = useState([])
  const [inspectores, setInspectores] = useState([])
  const [formData, setFormData] = useState({
    datos_ingreso_id: '',
    inspector_responsable: '',
    estado_inicial: 'gestionar_escritorio',
    //estado_actual: '',
    fecha_inspeccion: '',
    fecha_analisis_inspeccion: '',
    fecha_entrega_pj: '',
    fecha_notificacion_prst: '',
    cable: { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
    caja_empalme: { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
    reserva: { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
    nap: { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
    altura_final_poste: { tipo8:0,tipo9:0,tipo10:0,tipo11:0,tipo12:0,tipo14:0,tipo16:0 },
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const ing = await proyectosService.getIngresoNoVinculatedAll()
        setIngresos(ing || [])
        const ins = await inspectoresService.getAll()
        setInspectores(ins || [])
      } catch (err) {
        toast.error('Error al cargar datos')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNestedChange = (group, name, value) => {
    setFormData({ ...formData, [group]: { ...(formData[group]||{}), [name]: value === '' ? 0 : parseInt(value,10) } })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.datos_ingreso_id || !formData.fecha_inspeccion || !formData.fecha_analisis_inspeccion) {
      toast.error('Completa datos obligatorios: ingreso y fechas')
      return
    }
    setSaving(true)
    try {
      const payload = { ...formData }
      // normalize optional dates
      const dateFields = ['fecha_entrega_pj','fecha_notificacion_prst','fecha_inspeccion','fecha_analisis_inspeccion']
      dateFields.forEach((f)=> { if (payload[f] === '') payload[f] = null })
      await proyectosService.createProyecto(payload)
      toast.success('Proyecto creado')
      navigate('/proyectos')
    } catch (err) {
      console.error(err)
      const detail = err.response?.data || err.message || 'Error desconocido'
      toast.error(`Error al crear proyecto: ${JSON.stringify(detail)}`)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-6"><p>Cargando...</p></div>

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl md-6:text-1xl font-bold text-gray-900 dark:text-gray-100 text-1xl font-bold text-gray-800">Nuevo Proyecto</h2>
      <form onSubmit={handleSubmit} className="bg-blue-100 rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900.mb-2">
          <SearchableSelect
            label="Ingreso Proyecto (OT_AIRE)"
            name="datos_ingreso_id"
            value={formData.datos_ingreso_id}
            onChange={handleChange}
            options={ingresos.map((it) => ({ value: it.OT_AIRE, label: `${it.OT_AIRE} - ${it.nombre || ''}` }))}
            required
          />

          <SearchableSelect
            label="Inspector Responsable"
            name="inspector_responsable"
            value={formData.inspector_responsable}
            onChange={handleChange}
            options={inspectores.map((it) => ({ value: it.id?.toString?.() || it.pk || it.id, label: it.nombre || it.nombre_completo || String(it.user.username) }))}
          />

          {/*<Input label="Estado Actual" name="estado_actual" value={formData.estado_actual} onChange={handleChange} />*/}
          <Select label="Estado Inicial" name="estado_inicial" value={formData.estado_inicial} onChange={handleChange} options={ESTADO_INICIAL} />
          <Input label="Fecha Entrega PJ" name="fecha_entrega_pj" type="date" value={formData.fecha_entrega_pj} onChange={handleChange} />
          <Input label="Fecha Notificación PRST" name="fecha_notificacion_prst" type="date" value={formData.fecha_notificacion_prst} onChange={handleChange} />
          <Input label="Fecha Inspección" name="fecha_inspeccion" type="date" value={formData.fecha_inspeccion} onChange={handleChange} required />
          <Input label="Fecha Análisis Inspección" name="fecha_analisis_inspeccion" type="date" value={formData.fecha_analisis_inspeccion} onChange={handleChange} required />
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Cables</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.cable[k]} onChange={(e)=>handleNestedChange('cable', k, e.target.value)} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Caja Empalme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.caja_empalme[k]} onChange={(e)=>handleNestedChange('caja_empalme', k, e.target.value)} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Reserva</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.reserva[k]} onChange={(e)=>handleNestedChange('reserva', k, e.target.value)} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">NAP (Usos)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.nap[k]} onChange={(e)=>handleNestedChange('nap', k, e.target.value)} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Altura Final Poste</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo9','tipo10','tipo11','tipo12','tipo14','tipo16'].map((k) => (
              <Input key={k} label={k} name={k} type="number" value={formData.altura_final_poste[k]} onChange={(e)=>handleNestedChange('altura_final_poste', k, e.target.value)} />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear Proyecto'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/proyectos')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

export default ProyectosNew
