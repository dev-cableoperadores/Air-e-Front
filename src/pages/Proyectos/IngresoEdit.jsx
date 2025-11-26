import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { formatDateForInput } from '../../utils/formatters'

const departamentosOptions = [
  { value: 'atlantico', label: 'Atlantico' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'la_guajira', label: 'La Guajira' },
]

const IngresoEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(null)
  const [cableoperadores, setCableoperadores] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await proyectosService.getIngresoById(id)
        setFormData({
          ...data,
          // Pre-popular cableoperador_id para que el select tenga valor y no se envíe null
          cableoperador_id: data?.cableoperador ? String(data.cableoperador.id ?? data.cableoperador.pk ?? '') : '',
          fecha_inicio: formatDateForInput(data.fecha_inicio),
          fecha_fin: formatDateForInput(data.fecha_fin),
          fecha_confirmacion_fin: formatDateForInput(data.fecha_confirmacion_fin),
          fecha_radicacion_prst: formatDateForInput(data.fecha_radicacion_prst),
          fecha_revision_doc: formatDateForInput(data.fecha_revision_doc),
          altura_inicial_poste_input: data.altura_inicial_poste || { tipo8:0,tipo9:0,tipo10:0,tipo11:0,tipo12:0,tipo14:0,tipo16:0 }
        })
      } catch (error) {
        toast.error('Error al cargar ingreso')
        navigate('/proyectos/ingreso')
      } finally { setLoading(false) }
    }
    load()
    // load cableoperadores for select
    loadCableoperadores()
  }, [id])

  const loadCableoperadores = async () => {
    try {
      const data = await cableoperadoresService.getAllFull()
      const items = Array.isArray(data?.results) ? data.results : (data || [])
      setCableoperadores(items)
    } catch (err) {
      // ignore
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...formData }
      // Normalizar fechas vacías a null para evitar 400
      const dateFields = ['fecha_inicio','fecha_fin','fecha_confirmacion_fin','fecha_radicacion_prst','fecha_revision_doc']
      dateFields.forEach((f) => { if (payload[f] === '') payload[f] = null })
      // Asegurar cableoperador_id como número
      payload.cableoperador_id = payload.cableoperador_id ? parseInt(payload.cableoperador_id, 10) : null
      await proyectosService.updateIngreso(id, payload)
      toast.success('Ingreso actualizado')
      navigate('/proyectos/ingreso')
    } catch (error) {
      console.error(error)
      toast.error('Error al actualizar')
    } finally { setSaving(false) }
  }

  if (loading || !formData) return <Loading fullScreen />

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Editar Ingreso {id}</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          <SearchableSelect
            label="Cableoperador"
            name="cableoperador_id"
            value={formData.cableoperador_id}
            onChange={handleChange}
            options={cableoperadores.map((co) => ({ value: co.id.toString(), label: co.nombre_largo || co.nombre }))}
          />
            <Select label="Tipo Ingreso" name="TipoIngreso" value={formData.TipoIngreso} onChange={handleChange} options={[{value:'Viabilidad',label:'Viabilidad'},{value:'Instalacion',label:'Instalación'},{value:'Otro',label:'Otro'}]} />
            <Select label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} options={departamentosOptions} />
            <Input label="Municipio" name="municipio" value={formData.municipio} onChange={handleChange} />
            <Input label="Barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
            <Input label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} />
            <Input label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} />
            <Input label="Fecha Confirmación Fin" name="fecha_confirmacion_fin" type="date" value={formData.fecha_confirmacion_fin} onChange={handleChange} />
            <Input label="Fecha Radicación PRST" name="fecha_radicacion_prst" type="date" value={formData.fecha_radicacion_prst} onChange={handleChange} />
            <Input label="Fecha Revisión Documento" name="fecha_revision_doc" type="date" value={formData.fecha_revision_doc} onChange={handleChange} />
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="rechazado_GD" checked={formData.rechazado_GD} onChange={(e)=>setFormData({...formData, rechazado_GD: e.target.checked})} />
                <span>Rechazado GD</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="cancelado" checked={formData.cancelado} onChange={(e)=>setFormData({...formData, cancelado: e.target.checked})} />
                <span>Cancelado</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="incluir_contrato" checked={formData.incluir_contrato} onChange={(e)=>setFormData({...formData, incluir_contrato: e.target.checked})} />
                <span>Incluir en Contrato</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="negado" checked={formData.negado} onChange={(e)=>setFormData({...formData, negado: e.target.checked})} />
                <span>Negado</span>
              </label>
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Altura Inicial Poste (opcional)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(formData.altura_inicial_poste_input).map((k) => {
            
            // 💡 Transformación del Key (k) a Label descriptiva
            // 'tipo8' -> '8' -> 'Altura 8m'
            const displayLabel = `Altura ${k.replace('tipo', '')}m`;
            
            return (
              <Input 
                key={k} 
                // 🚀 Asignamos la etiqueta descriptiva al 'label'
                label={displayLabel} 
                
                // Mantenemos el nombre original del campo para el manejo de datos
                name={k} 
                
                type="number" 
                value={formData.altura_inicial_poste_input[k]} 
                onChange={handleAlturaChange} 
              />
              );
            })}
        </div>
        </div>

        <div>
          <Input label="Observaciones" name="observaciones" value={formData.observaciones || ''} onChange={handleChange} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Guardando...' : 'Actualizar'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/proyectos/ingreso')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

export default IngresoEdit
