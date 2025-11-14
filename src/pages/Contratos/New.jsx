import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Button from '../../components/UI/Button'
import { ChevronDown } from 'lucide-react'
import Loading from '../../components/UI/Loading'
import { ESTADOS_CONTRATO } from '../../utils/constants'
import { VIGENCIA_AMPARO_POLIZA , MONTO_ASEGURADO_POLIZA_CUMPLIMIENTO, MONTO_ASEGURADO_POLIZA_RCE } from '../../utils/constants'

const ContratosNew = () => {
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
      // Traer solo la primera página para el select (más eficiente)
      const data = await cableoperadoresService.getAllFull()
      const items = Array.isArray(data?.results) ? data.results : (data || [])
      setCableoperadores(items)
    } catch (error) {
      toast.error('Error al cargar cableoperadores, vuelve a intentarlo')
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

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Valores de ejemplo para ESTADOS_CONTRATO (ajústalos según tu aplicación)
  const VIGENTE = 'Vigente';
  const VENCIDO = 'Vencido';
  // Incluimos fin_vigencia para evitar loop, y setFormData (si viene de props).
  // 🚀 Lógica de CÁLCULO AUTOMÁTICO
  const determinarEstado = useCallback((inicio, fin) => {
        const hoy = new Date();
        // Normalizamos 'hoy' a solo la fecha (sin hora) para una comparación limpia.
        // Creamos un string 'YYYY-MM-DD' de hoy para crear un nuevo Date sin hora local:
        const hoyString = hoy.toISOString().split('T')[0];
        const fechaActual = new Date(hoyString + 'T00:00:00');
        // Convertir las fechas del formulario a objetos Date, asegurando que sean solo la fecha
        const fechaInicio = inicio ? new Date(inicio + 'T00:00:00') : null;
        const fechaFin = fin ? new Date(fin + 'T00:00:00') : null;

        if (!fechaInicio || !fechaFin) {
            return ''; // Estado indeterminado si faltan fechas
        }
        // Lógica de 3 estados:
        // 1. Si la Fecha de Inicio es FUTURA, está PENDIENTE
        if (fechaInicio > fechaActual) {
            return VIGENTE; // O usa 'Pendiente' si tienes ese estado
        }
        // 2. Si la Fecha de Fin es FUTURA (Hoy < Fin), está VIGENTE
        if (fechaActual < fechaFin) {
            return VIGENTE;
        }
        // 3. En cualquier otro caso (Hoy >= Fin), está VENCIDO
        return VENCIDO;
    }, []); // No tiene dependencias externas
  useEffect(() => {
    const inicioVigencia = formData.inicio_vigencia;
    // Usamos Number() en lugar de parseInt() para manejar mejor el caso de campos vacíos (se convierte a 0)
    const duracionAnos = Number(formData.duracion_anos); 
    // Solo procede si tenemos una fecha de inicio válida y una duración (incluso 0)
    if (inicioVigencia && !isNaN(duracionAnos) && duracionAnos >= 0) {
      
      // 1. Crear el objeto Date de inicio
      // Es crucial añadir 'T00:00:00' o trabajar con UTC para evitar que problemas de zona horaria 
      // muevan la fecha un día.
      const fechaInicio = new Date(inicioVigencia + 'T00:00:00'); 

      if (!isNaN(fechaInicio.getTime())) {
        // 2. Calcular la fecha de fin
        const fechaFin = new Date(fechaInicio);
        fechaFin.setFullYear(fechaFin.getFullYear() + duracionAnos);

        // 3. Formatear la fecha al formato YYYY-MM-DD
        const year = fechaFin.getFullYear();
        const month = String(fechaFin.getMonth() + 1).padStart(2, '0');
        const day = String(fechaFin.getDate()).padStart(2, '0');
        const finVigenciaCalculada = `${year}-${month}-${day}`;

        // 4. Actualizar el estado si la fecha calculada es diferente a la actual
        // Esto previene un loop infinito del useEffect
        if (formData.fin_vigencia !== finVigenciaCalculada) {
          // Usamos el callback para asegurarnos de que solo actualizamos 'fin_vigencia'
          setFormData(prevData => ({
            ...prevData,
            fin_vigencia: finVigenciaCalculada,
          }));
        }
      }
    }
    
const nuevoEstado = determinarEstado(formData.inicio_vigencia, formData.fin_vigencia);
        // Solo actualiza si el nuevo estado calculado es diferente al estado actual
        // y el estado actual NO fue establecido manualmente por el usuario (si es posible).
        if (formData.estado_contrato !== nuevoEstado) {
             setFormData(prevData => ({
                ...prevData,
                estado_contrato: nuevoEstado,
            }));
        }
        
    }, [formData.inicio_vigencia, formData.duracion_anos, determinarEstado]);
    
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

      //console.log('Payload contrato create:', dataToSend)
      await contratosService.create(dataToSend)
      toast.success('Contrato creado exitosamente')
      navigate('/contratos')
    } catch (error) {
      //console.error('Error creating contrato:', error.response?.data || error)
      const detail = error.response?.data || error.message || 'Error desconocido'
      toast.error(`Error al crear contrato: ${JSON.stringify(detail)}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-gray-100">Nuevo Contrato</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableSelect
            label="Cableoperador"
            name="cableoperador"
            value={formData.cableoperador}
            onChange={handleChange}
            options={cableoperadores.map((co) => ({ value: co.id.toString(), label: co.nombre_largo || co.nombre }))}
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
        </div>
        {/*Secciones de la poliza*/}
        <h3 className="text-lg font-semibold">Campos de la Póliza de Cumplimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campos de la póliza de cumplimiento */}
          <Input
            label="Número de poliza de cumplimiento"
            name="numero_poliza_cumplimiento"
            type="text"
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
            label="Valor asegurado de la cumplimiento"
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
            type="text"
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
            label="Fin amparo de la póliza"
            name="fin_amparo_poliza_rce"
            type="date"
            value={formData.fin_amparo_poliza_rce}
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
                      'Altura 8m','Altura 10m','Altura 12m','Altura 14m','Altura 15m','Altura 16m','Altura 20m',
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
