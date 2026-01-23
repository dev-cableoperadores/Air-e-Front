import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import contratosService from '../../services/contratosService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { ChevronDown } from 'lucide-react'

const ContratosDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [contrato, setContrato] = useState(null)
  const [openSections, setOpenSections] = useState({
    polizaCumplimiento: false,
    polizaRCE: false,
    nap: false,
    cable: false,
    caja_empalme: false,
    reserva: false,
  })

  useEffect(() => {
    loadContrato()
  }, [id])

  const loadContrato = async () => {
    try {
      setLoading(true)
      const data = await contratosService.getById(id)
      // Si tenemos un ID de cableoperador, obtener sus detalles
      if (data.cableoperador) {
        try {
          const cableoperadorData = await cableoperadoresService.getById(data.cableoperador.id)
          // Combinar los datos del contrato con los detalles del cable-operador
          setContrato({
            ...data,
            cableoperador: cableoperadorData
          })
        } catch (error) {
          //console.error('Error al cargar detalles del cableoperador:', error)
          setContrato(data)
        }
      } else {
        setContrato(data)
      }
    } catch (error) {
      //console.error('Error al cargar contrato:', error)
      toast.error('Error al cargar contrato')
      navigate('/contratos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este contrato?')) {
      try {
        await contratosService.delete(id)
        toast.success('Contrato eliminado')
        navigate('/contratos')
      } catch (error) {
        toast.error('Error al eliminar contrato')
      }
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

  if (!contrato) {
    return <div>Contrato no encontrado</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Detalle Contrato</h2>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <Link to={`/contratos/${id}/editar`}>
            <Button variant="secondary" className="w-full sm:w-auto text-xs sm:text-sm">✏️ Editar</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto text-xs sm:text-sm">
            🗑️ Eliminar
          </Button>
          <Link to="/contratos">
            <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">← Volver</Button>
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 space-y-2">
          <h3>
            Contrato de {contrato.cableoperador?.nombre || 'N/A'}
          </h3>
          <p className="text-xs sm:text-sm opacity-90">
            📋 Estado: {contrato.estado_contrato}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <DetailField label="Cableoperador" value={contrato.cableoperador?.nombre || 'N/A'} />
          <DetailField
            label="Estado del Contrato"
            value={
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  contrato.estado_contrato === 'Vigente'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {contrato.estado_contrato}
              </span>
            }
          />
          <DetailField label="Duración en Años" value={contrato.duracion_anos || 'N/A'} />
          <DetailField
            label="Valor del Contrato"
            value={formatCurrency(contrato.valor_contrato)}
          />
          <DetailField
            label="Fecha de Inicio"
            value={formatDate(contrato.inicio_vigencia)}
          />
          <DetailField label="Fecha de Fin" value={formatDate(contrato.fin_vigencia)} />
          <DetailField label="Fecha de Radicación" value={contrato.fecha_radicacion || 'N/A'} />
          <DetailField
            label="Tipo de Fecha de Radicación"
            value={contrato.tipo_fecha_radicacion === 'fija' ? 'Fija' : 'Dinámica'}
          />
        </div>

        {/* Campos adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <DetailField label="Tomador" value={contrato.tomador || 'N/A'} />
          <DetailField label="Aseguradora" value={contrato.aseguradora || 'N/A'} />
          <DetailField label="Fecha Preliquidación" value={formatDate(contrato.fecha_preliquidacion)} />
        </div>

        {/* Póliza de Cumplimiento */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('polizaCumplimiento')}
            className="w-full flex justify-between items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50"
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Póliza de Cumplimiento</h3>
            <ChevronDown
              className={`w-5 h-5 transform transition-transform ${
                openSections.polizaCumplimiento ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.polizaCumplimiento && (
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <DetailField label="Número de Póliza" value={contrato.numero_poliza_cumplimiento || 'N/A'} />
                <DetailField label="Inicio Vigencia" value={formatDate(contrato.inicio_vigencia_poliza_cumplimiento)} />
                <DetailField label="Fin Vigencia" value={formatDate(contrato.fin_vigencia_poliza_cumplimiento)} />
                <DetailField label="Vigencia Amparo" value={contrato.vigencia_amparo_poliza_cumplimiento || 'N/A'} />
                <DetailField label="Inicio Amparo" value={formatDate(contrato.inicio_amparo_poliza_cumplimiento)} />
                <DetailField label="Fin Amparo" value={formatDate(contrato.fin_amparo_poliza_cumplimiento)} />
                <DetailField label="Monto Asegurado" value={contrato.monto_asegurado_poliza_cumplimiento || 'N/A'} />
                <DetailField label="Valor Monto Asegurado" value={formatCurrency(contrato.valor_monto_asegurado_poliza_cumplimiento)} />
                <DetailField label="Valor Asegurado" value={formatCurrency(contrato.valor_asegurado_poliza_cumplimiento)} />
                <DetailField label="Expedición" value={formatDate(contrato.expedicion_poliza_cumplimiento)} />
              </div>
            </div>
          )}
        </div>

        {/* Póliza de RCE */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('polizaRCE')}
            className="w-full flex justify-between items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50"
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Póliza de RCE</h3>
            <ChevronDown
              className={`w-5 h-5 transform transition-transform ${
                openSections.polizaRCE ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSections.polizaRCE && (
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <DetailField label="Número de Póliza" value={contrato.numero_poliza_rce || 'N/A'} />
                <DetailField label="Inicio Vigencia" value={formatDate(contrato.inicio_vigencia_poliza_rce)} />
                <DetailField label="Fin Vigencia" value={formatDate(contrato.fin_vigencia_poliza_rce)} />
                <DetailField label="Vigencia Amparo" value={contrato.vigencia_amparo_poliza_rce || 'N/A'} />
                <DetailField label="Inicio Amparo" value={formatDate(contrato.inicio_amparo_poliza_rce)} />
                <DetailField label="Fin Amparo" value={formatDate(contrato.fin_amparo_poliza_rce)} />
                <DetailField label="Monto Asegurado" value={contrato.monto_asegurado_poliza_rce || 'N/A'} />
                <DetailField label="Valor Monto Asegurado" value={formatCurrency(contrato.valor_monto_asegurado_poliza_rce)} />
                <DetailField label="Valor Asegurado" value={formatCurrency(contrato.valor_asegurado_poliza_rce)} />
                <DetailField label="Expedición" value={formatDate(contrato.expedicion_poliza_rce)} />
              </div>
            </div>
          )}
        </div>

        {/* Secciones de Usos */}
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Sección de Usos</h3>
        <div className="space-y-2">
          {['nap', 'cable', 'caja_empalme', 'reserva'].map((section) => (
            <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section)}
                className="w-full flex justify-between items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/30 hover:bg-gray-100 dark:hover:bg-gray-900/50"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">{section.replace('_', ' ')}</h3>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${
                    openSections[section] ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openSections[section] && (
                <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      'tipo8',
                      'tipo10',
                      'tipo12',
                      'tipo14',
                      'tipo15',
                      'tipo16',
                      'tipo20',
                    ].map((key) => {
                      const getLabel = (inputKey) => {
                        const num = inputKey.replace('tipo', '')
                        return `${num}m`
                      }
                      const labelText = getLabel(key)
                      return (
                        <DetailField
                          key={key}
                          label={labelText}
                          value={contrato[section]?.[key] || 0}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DetailField = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">{value}</p>
  </div>
)

export default ContratosDetail

