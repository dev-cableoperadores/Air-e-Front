import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import inspectoresService from '../../services/inspectoresService'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { formatDateForInput } from '../../utils/formatters'
import { ESTADO_INICIAL } from '../../utils/constants'

const departamentosOptions = [
  { value: 'atlantico', label: 'Atlantico' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'la_guajira', label: 'La Guajira' },
]

const ProyectosEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(null)
  const [ingresos, setIngresos] = useState([])
  const [inspectores, setInspectores] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await proyectosService.getProyectoById(id)
        setFormData({
          ...data,
          datos_ingreso_id: data?.datos_ingreso?.OT_AIRE || data?.datos_ingreso || '',
          inspector_responsable: data?.inspector_responsable?.id?.toString?.() || data?.inspector_responsable || '',
          fecha_inspeccion: formatDateForInput(data.fecha_inspeccion),
          fecha_analisis_inspeccion: formatDateForInput(data.fecha_analisis_inspeccion),
          estado_inicial: data.estado_inicial || 'gestionar_escritorio',
          fecha_entrega_pj: formatDateForInput(data.fecha_entrega_pj),
          fecha_notificacion_prst: formatDateForInput(data.fecha_notificacion_prst),
          cable: data.cable || { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
          caja_empalme: data.caja_empalme || { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
          reserva: data.reserva || { tipo8:0,tipo10:0,tipo12:0,tipo14:0,tipo15:0,tipo16:0,tipo20:0 },
          nap: data.nap || { tip8:0,tip10:0,tip12:0,tip14:0,tip15:0,tip16:0,tip20:0 },
          altura_final_poste: data.altura_final_poste || { tipo8:0,tipo9:0,tipo10:0,tipo11:0,tipo12:0,tipo14:0,tipo16:0 },
        })
        const ing = await proyectosService.getIngresoAll()
        setIngresos(ing || [])
        const ins = await inspectoresService.getAll()
        setInspectores(ins || [])
      } catch (err) {
        toast.error('Error al cargar proyecto')
        navigate('/proyectos')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNestedChange = (group, name, value) => {
    setFormData({ ...formData, [group]: { ...(formData[group]||{}), [name]: value === '' ? 0 : parseInt(value,10) } })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...formData }
      const dateFields = ['fecha_inspeccion','fecha_analisis_inspeccion','fecha_entrega_pj','fecha_notificacion_prst']
      dateFields.forEach((f) => { if (payload[f] === '') payload[f] = null })
      await proyectosService.updateProyecto(id, payload)
      toast.success('Proyecto actualizado')
      navigate('/proyectos')
    } catch (err) {
      console.error(err)
      toast.error('Error al actualizar proyecto')
    } finally { setSaving(false) }
  }

  if (loading || !formData) return <Loading fullScreen />

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Proyecto</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <Select label="Estado Inicial" name="estado_inicial" value={formData.estado_inicial} onChange={handleChange} options={ESTADO_INICIAL} />
          <Input label="Estado Actual" name="estado_actual" value={formData.estado_actual} onChange={handleChange} />
          <Input label="Fecha Inspección" name="fecha_inspeccion" type="date" value={formData.fecha_inspeccion} onChange={handleChange} />
          <Input label="Fecha Análisis Inspección" name="fecha_analisis_inspeccion" type="date" value={formData.fecha_analisis_inspeccion} onChange={handleChange} />
          <Input label="Fecha Entrega PJ" name="fecha_entrega_pj" type="date" value={formData.fecha_entrega_pj} onChange={handleChange} />
          <Input label="Fecha Notificación PRST" name="fecha_notificacion_prst" type="date" value={formData.fecha_notificacion_prst} onChange={handleChange} />
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Cables</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => {
              
              // 💡 Transformación de 'tipo8' a 'Altura 8m'
              // 1. k.replace('tipo', '') extrae el número (ej: '8')
              // 2. El template literal construye la cadena 'Altura 8m'
              const alturaLabel = `Altura ${k.replace('tipo', '')}m`; 

              return (
                <Input 
                  key={k} 
                  // 🚀 Usamos la etiqueta transformada aquí
                  label={alturaLabel} 
                  
                  // Mantenemos el nombre original del campo para el manejo de datos
                  name={k} 
                  
                  type="number" 
                  value={formData.cable[k]} 
                  onChange={(e)=>handleNestedChange('cable', k, e.target.value)} 
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Caja Empalme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => {
              
              // 💡 Transformación de 'tipo8' a 'Altura 8m'
              // 1. k.replace('tipo', '') extrae el número (ej: '8')
              // 2. El template literal construye la cadena 'Altura 8m'
              const alturaLabel = `Altura ${k.replace('tipo', '')}m`; 

              return (
                <Input 
                  key={k} 
                  // 🚀 Usamos la etiqueta transformada aquí
                  label={alturaLabel} 
                  
                  // Mantenemos el nombre original del campo para el manejo de datos
                  name={k} 
                  
                  type="number" 
                  value={formData.caja_empalme[k]} 
                  onChange={(e)=>handleNestedChange('caja_empalme', k, e.target.value)} 
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Reserva</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo10','tipo12','tipo14','tipo15','tipo16','tipo20'].map((k) => {
              
              // 💡 Transformación de 'tipo8' a 'Altura 8m'
              // 1. k.replace('tipo', '') extrae el número (ej: '8')
              // 2. El template literal construye la cadena 'Altura 8m'
              const alturaLabel = `Altura ${k.replace('tipo', '')}m`; 

              return (
                <Input 
                  key={k} 
                  // 🚀 Usamos la etiqueta transformada aquí
                  label={alturaLabel} 
                  
                  // Mantenemos el nombre original del campo para el manejo de datos
                  name={k} 
                  
                  type="number" 
                  value={formData.reserva[k]} 
                  onChange={(e)=>handleNestedChange('reserva', k, e.target.value)} 
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">NAP (Usos)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tip8','tip10','tip12','tip14','tip15','tip16','tip20'].map((k) => {
              
              // 💡 Transformación de 'tipo8' a 'Altura 8m'
              // 1. k.replace('tipo', '') extrae el número (ej: '8')
              // 2. El template literal construye la cadena 'Altura 8m'
              const alturaLabel = `Altura ${k.replace('tip', '')}m`; 

              return (
                <Input 
                  key={k} 
                  // 🚀 Usamos la etiqueta transformada aquí
                  label={alturaLabel} 
                  
                  // Mantenemos el nombre original del campo para el manejo de datos
                  name={k} 
                  
                  type="number" 
                  value={formData.nap[k]} 
                  onChange={(e)=>handleNestedChange('nap', k, e.target.value)} 
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Altura Final Poste</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['tipo8','tipo9','tipo10','tipo11','tipo12','tipo14','tipo16'].map((k) => {
              const alturaLabel = `Altura ${k.replace('tipo', '')}m`;
              return (
                <Input key={k} label={alturaLabel} name={k} type="number" value={formData.altura_final_poste[k]} onChange={(e)=>handleNestedChange('altura_final_poste', k, e.target.value)} />
              )
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Actualizar'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/proyectos')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

export default ProyectosEdit
