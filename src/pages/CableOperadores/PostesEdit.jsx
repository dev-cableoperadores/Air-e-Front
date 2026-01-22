import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import postesService from '../../services/postesService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import Textarea from '../../components/UI/Textarea'
import {
  MATERIALES_POSTE,
  TIPO_POSTE,
  DEPARTAMENTOS_POSTES,
  FUENTE_USOS,
  TIPO_COORDENADA,
  TIPO_ELEMENTO,
} from '../../utils/constants'

const PostesEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cableoperadores, setCableoperadores] = useState([])
  const [formData, setFormData] = useState({
    object_id: '',
    shape: '',
    globalid: '',
    numero_poste: '',
    codigo_poste: '',
    tipo_coordenada: '',
    coordenada_x: '',
    coordenada_y: '',
    material_poste: '',
    tipo_poste: '',
    altura_poste: '',
    estado_proyecto: '',
    departamento: '',
    municipio: '',
    cableoperador: '',
    tipo_elemento: '',
    nombre_proyecto: '',
    fuente_de_usos: '',
    observaciones: '',
    elementos_existentes: '',
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [posteData, cableoperadoresData] = await Promise.all([
        postesService.getById(id),
        cableoperadoresService.getAllAllPages(),
      ])

      // Normalizar cableoperadores
      const cableOps = Array.isArray(cableoperadoresData?.results)
        ? cableoperadoresData.results
        : Array.isArray(cableoperadoresData)
        ? cableoperadoresData
        : []

      setCableoperadores(cableOps)

      // Mapear cableoperador a ID si es un objeto
      const cableoperadorId = posteData.cableoperador?.id || posteData.cableoperador || ''

      setFormData({
        object_id: posteData.object_id?.toString() || '',
        shape: posteData.shape || '',
        globalid: posteData.globalid || '',
        numero_poste: posteData.numero_poste || '',
        codigo_poste: posteData.codigo_poste?.toString() || '',
        tipo_coordenada: posteData.tipo_coordenada || '',
        coordenada_x: posteData.coordenada_x?.toString() || '',
        coordenada_y: posteData.coordenada_y?.toString() || '',
        material_poste: posteData.material_poste || '',
        tipo_poste: posteData.tipo_poste || '',
        altura_poste: posteData.altura_poste?.toString() || '',
        estado_proyecto: posteData.estado_proyecto || '',
        departamento: posteData.departamento || '',
        municipio: posteData.municipio || '',
        cableoperador: cableoperadorId.toString() || '',
        tipo_elemento: posteData.tipo_elemento || '',
        nombre_proyecto: posteData.nombre_proyecto || '',
        fuente_de_usos: posteData.fuente_de_usos || '',
        observaciones: posteData.observaciones || '',
        elementos_existentes: posteData.elementos_existentes || '',
      })
    } catch (error) {
      console.error('Error cargando poste:', error)
      toast.error('Error al cargar el poste')
      navigate('/postes')
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

    // Validaciones básicas
    if (!formData.codigo_poste || !String(formData.codigo_poste).trim()) {
      toast.error('El código del poste es requerido')
      return
    }

    if (!formData.numero_poste || !String(formData.numero_poste).trim()) {
      toast.error('El número del poste es requerido')
      return
    }

    if (!formData.shape || !String(formData.shape).trim()) {
      toast.error('El tipo de forma (shape) es requerido')
      return
    }

    if (!formData.cableoperador) {
      toast.error('El cable operador es requerido')
      return
    }

    if (!formData.coordenada_x || !formData.coordenada_y) {
      toast.error('Las coordenadas son requeridas')
      return
    }

    // Validar que las coordenadas sean números válidos
    const x = parseFloat(formData.coordenada_x)
    const y = parseFloat(formData.coordenada_y)
    if (isNaN(x) || isNaN(y)) {
      toast.error('Las coordenadas deben ser números válidos')
      return
    }

    setSaving(true)

    try {
      const dataToSend = {
        object_id: parseInt(formData.object_id) || 0,
        shape: formData.shape || '',
        globalid: formData.globalid || null,
        numero_poste: formData.numero_poste || '',
        codigo_poste: parseInt(formData.codigo_poste) || 0,
        tipo_coordenada: formData.tipo_coordenada || '',
        coordenada_x: parseFloat(formData.coordenada_x),
        coordenada_y: parseFloat(formData.coordenada_y),
        material_poste: formData.material_poste || null,
        tipo_poste: formData.tipo_poste || null,
        altura_poste: formData.altura_poste ? parseFloat(formData.altura_poste) : null,
        estado_proyecto: formData.estado_proyecto || null,
        departamento: formData.departamento || '',
        municipio: formData.municipio || null,
        cableoperador_id: formData.cableoperador ? parseInt(formData.cableoperador) : null,
        tipo_elemento: formData.tipo_elemento || null,
        nombre_proyecto: formData.nombre_proyecto || null,
        fuente_de_usos: formData.fuente_de_usos || null,
        observaciones: formData.observaciones || null,
        elementos_existentes: formData.elementos_existentes || null,
      }

      console.log('Datos enviados:', dataToSend)
      await postesService.update(id, dataToSend)
      toast.success('Poste actualizado exitosamente')
      navigate('/postes')
    } catch (error) {
      console.error('Error actualizando poste:', error)
      console.error('Respuesta del servidor:', error.response?.data)
      const errorMessage = error.response?.data?.detail || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Error al actualizar el poste'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Editar Poste
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        {/* Sección: Información Básica */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Información Básica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Object ID"
              name="object_id"
              type="number"
              value={formData.object_id}
              onChange={handleChange}
              placeholder="Ej: 1"
            />
            <Input
              label="Número del Poste"
              name="numero_poste"
              value={formData.numero_poste}
              onChange={handleChange}
              required
              placeholder="Ej: POSTE-12345"
            />
            <Input
              label="Código del Poste"
              name="codigo_poste"
              type="number"
              value={formData.codigo_poste}
              onChange={handleChange}
              required
              placeholder="Ej: 12345"
            />
            <Input
              label="Shape (Forma)"
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              required
              placeholder="Ej: Point"
            />
            <Select
              label="Tipo de Coordenada"
              name="tipo_coordenada"
              value={formData.tipo_coordenada}
              onChange={handleChange}
              options={[{ value: '', label: 'Seleccionar...' }, ...TIPO_COORDENADA]}
              required
            />
            <Input
              label="Global ID"
              name="globalid"
              value={formData.globalid}
              onChange={handleChange}
              placeholder="Global ID"
            />
            <Input
              label="Coordenada X (Longitud)"
              name="coordenada_x"
              type="number"
              step="0.0001"
              value={formData.coordenada_x}
              onChange={handleChange}
              required
              placeholder="Ej: -75.5"
            />
            <Input
              label="Coordenada Y (Latitud)"
              name="coordenada_y"
              type="number"
              step="0.0001"
              value={formData.coordenada_y}
              onChange={handleChange}
              required
              placeholder="Ej: 10.4"
            />
          </div>
        </div>

        {/* Sección: Características del Poste */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Características del Poste
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Material"
              name="material_poste"
              value={formData.material_poste}
              onChange={handleChange}
              options={MATERIALES_POSTE}
            />
            <Select
              label="Tipo de Poste"
              name="tipo_poste"
              value={formData.tipo_poste}
              onChange={handleChange}
              options={TIPO_POSTE}
            />
            <Input
              label="Altura (metros)"
              name="altura_poste"
              type="number"
              step="0.1"
              value={formData.altura_poste}
              onChange={handleChange}
              placeholder="Ej: 12.5"
            />
            <Select
              label="Tipo de Elemento"
              name="tipo_elemento"
              value={formData.tipo_elemento}
              onChange={handleChange}
              options={TIPO_ELEMENTO}
            />
          </div>
        </div>

        {/* Sección: Ubicación y Proyecto */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Ubicación y Proyecto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              options={DEPARTAMENTOS_POSTES}
            />
            <Input
              label="Municipio"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              placeholder="Ej: Barranquilla"
            />
            <Select
              label="Cable Operador"
              name="cableoperador"
              value={formData.cableoperador}
              onChange={handleChange}
              options={cableoperadores.map((co) => ({
                value: co.id.toString(),
                label: co.nombre,
              }))}
            />
            <Input
              label="Nombre del Proyecto"
              name="nombre_proyecto"
              value={formData.nombre_proyecto}
              onChange={handleChange}
              placeholder="Ej: Expansión Zona Atlántica"
            />
            <Input
              label="Estado del Proyecto"
              name="estado_proyecto"
              value={formData.estado_proyecto}
              onChange={handleChange}
            />
            <Select
              label="Fuente de Usos"
              name="fuente_de_usos"
              value={formData.fuente_de_usos}
              onChange={handleChange}
              options={FUENTE_USOS}
            />
          </div>
        </div>

        {/* Sección: Observaciones */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
            Observaciones
          </h3>
          <Textarea
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales sobre el poste..."
            rows={4}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-end pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/postes')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PostesEdit