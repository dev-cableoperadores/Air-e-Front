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
import { TIPOS_INGRESO, MUNICIPIOS_COLOMBIA } from '../../utils/constants'

const departamentosOptions = [
  { value: 'atlantico', label: 'Atlantico' },
  { value: 'magdalena', label: 'Magdalena' },
  { value: 'la_guajira', label: 'La Guajira' },
]

const DEPARTAMENTO_LABEL_MAP = {
  atlantico: 'Atlántico',
  magdalena: 'Magdalena',
  la_guajira: 'La Guajira',
}


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
    if (name === 'departamento') {
      setFormData({ ...formData, departamento: value, municipio: '', barrio: '' })
    } else {
      setFormData({ ...formData, [name]: value })
    }
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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 px-2 sm:px-0">Editar Ingreso {id}</h2>
      <form onSubmit={handleSubmit} className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 mx-2 sm:mx-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          <SearchableSelect
            label="Cableoperador"
            name="cableoperador_id"
            value={formData.cableoperador_id}
            onChange={handleChange}
            options={cableoperadores.map((co) => ({ value: co.id.toString(), label: co.nombre_largo || co.nombre }))}
          />
            <Select label="Tipo Ingreso" name="TipoIngreso" value={formData.TipoIngreso} onChange={handleChange} options={TIPOS_INGRESO} />
            <Select label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} options={departamentosOptions} />
            <Select
              label="Municipio"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              options={
                MUNICIPIOS_COLOMBIA[DEPARTAMENTO_LABEL_MAP[formData.departamento]] || []
              }
            />
            <Input label="Barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
            <Input label="Fecha Inicio" name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleChange} />
            <Input label="Fecha Fin" name="fecha_fin" type="date" value={formData.fecha_fin} onChange={handleChange} />
            <Input label="Fecha Confirmación Fin" name="fecha_confirmacion_fin" type="date" value={formData.fecha_confirmacion_fin} onChange={handleChange} />
            <Input label="Fecha Radicación PRST" name="fecha_radicacion_prst" type="date" value={formData.fecha_radicacion_prst} onChange={handleChange} />
            <Input label="Fecha Revisión Documento" name="fecha_revision_doc" type="date" value={formData.fecha_revision_doc} onChange={handleChange} />
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="rechazado_GD" checked={formData.rechazado_GD} onChange={(e)=>setFormData({...formData, rechazado_GD: e.target.checked})} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Rechazado GD</span>
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="cancelado" checked={formData.cancelado} onChange={(e)=>setFormData({...formData, cancelado: e.target.checked})} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Cancelado</span>
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="incluir_contrato" checked={formData.incluir_contrato} onChange={(e)=>setFormData({...formData, incluir_contrato: e.target.checked})} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Incluir en Contrato</span>
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input type="checkbox" name="negado" checked={formData.negado} onChange={(e)=>setFormData({...formData, negado: e.target.checked})} className="w-4 h-4" />
              <span className="text-gray-700 dark:text-gray-300">Negado</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-3">Altura Inicial Poste (opcional)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {Object.keys(formData.altura_inicial_poste_input).map((k) => {
              const displayLabel = `Altura ${k.replace('tipo', '')}m`;
              return (
                <Input 
                  key={k} 
                  label={displayLabel} 
                  name={k} 
                  type="number" 
                  value={formData.altura_inicial_poste_input[k]} 
                  onChange={handleAlturaChange} 
                  className="text-xs sm:text-sm"
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto text-xs sm:text-sm">{saving ? 'Guardando...' : 'Actualizar'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/proyectos/ingreso')} className="w-full sm:w-auto text-xs sm:text-sm">Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

export default IngresoEdit
