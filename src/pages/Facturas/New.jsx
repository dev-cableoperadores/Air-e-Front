import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { convertMonthToDate, addOneMonth, formatDateForInput } from '../../utils/formatters'

const FacturasNew = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cableoperadores, setCableoperadores] = useState([])
  const [formData, setFormData] = useState({
    cableoperador: '',
    Mes_uso: '',
    Fecha_facturacion: new Date().toISOString().split('T')[0],
    Num_factura: '',
    Valor_facturado_iva: '',
    Valor_iva_millones: '',
    Fecha_vencimiento: '',
    Periodo_vencimiento: '',
    estado: 'Pendiente',
    Factura_aceptada: true,
    Factura_CRC: false,
  })

  useEffect(() => {
    loadCableoperadores()
  }, [])

  const loadCableoperadores = async () => {
    try {
      const data = await cableoperadoresService.getAllAllPages()
      const items = Array.isArray(data?.results) ? data.results : (data || [])
      setCableoperadores(items)
    } catch (error) {
      toast.error('Error al cargar cableoperadores')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const newFormData = { ...formData, [name]: value }
    
    // Si cambia Mes_uso, calcular automáticamente Periodo_vencimiento
    if (name === 'Mes_uso' && value) {
      newFormData.Periodo_vencimiento = addOneMonth(value)
    }
    
    setFormData(newFormData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.cableoperador || !formData.Num_factura) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setSaving(true)

    try {
      const dataToSend = {
        cableoperador: parseInt(formData.cableoperador),
        Mes_uso: convertMonthToDate(formData.Mes_uso),
        Fecha_facturacion: formData.Fecha_facturacion,
        Num_factura: formData.Num_factura,
        Valor_facturado_iva: formData.Valor_facturado_iva || "0.00",
        Valor_iva_millones: parseFloat(formData.Valor_iva_millones) || 0,
        Fecha_vencimiento: formData.Fecha_vencimiento,
        Periodo_vencimiento: convertMonthToDate(formData.Periodo_vencimiento),
        estado: formData.estado,
        Factura_aceptada: formData.Factura_aceptada,
        Factura_CRC: formData.Factura_CRC,
      }

      await facturasService.create(dataToSend)
      toast.success('Factura creada exitosamente')
      navigate('/facturas')
    } catch (error) {
      const detail = error.response?.data || error.message || 'Error desconocido'
      toast.error(`Error al crear factura: ${JSON.stringify(detail)}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 px-2 sm:px-0">Nueva Factura</h2>
      <form onSubmit={handleSubmit} className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 mx-2 sm:mx-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <SearchableSelect
            label="Cableoperador"
            name="cableoperador"
            value={formData.cableoperador}
            onChange={handleChange}
            options={cableoperadores.map((c) => ({
              value: c.id.toString(),
              label: `${c.nombre_largo || c.nombre}`,
            }))}
            required
          />
          <Input
            label="Número de Factura"
            name="Num_factura"
            type="text"
            value={formData.Num_factura}
            onChange={handleChange}
            placeholder="Ej: FAC-2025-001"
            required
          />
          <Input
            label="Mes de Uso"
            name="Mes_uso"
            type="month"
            value={formData.Mes_uso}
            onChange={handleChange}
            required
          />
          <Input
            label="Fecha de Facturación"
            name="Fecha_facturacion"
            type="date"
            value={formData.Fecha_facturacion}
            onChange={handleChange}
            required
          />
          <Input
            label="Fecha de Vencimiento"
            name="Fecha_vencimiento"
            type="date"
            value={formData.Fecha_vencimiento}
            onChange={handleChange}
            required
          />
          <Input
            label="Período de Vencimiento"
            name="Periodo_vencimiento"
            type="month"
            value={formData.Periodo_vencimiento}
            onChange={handleChange}
            disabled
            required
          />
          <Input
            label="Valor Facturado (IVA)"
            name="Valor_facturado_iva"
            type="number"
            step="0.01"
            value={formData.Valor_facturado_iva}
            onChange={handleChange}
            required
          />
          <Input
            label="Valor IVA (millones)"
            name="Valor_iva_millones"
            type="number"
            step="0.01"
            value={formData.Valor_iva_millones}
            onChange={handleChange}
          />
          <Select
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            options={[
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'PagadaParcial', label: 'Pago Parcial' },
              { value: 'Pagada', label: 'Pagada' },
              { value: 'Anulada', label: 'Anulada' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="checkbox"
              id="Factura_aceptada"
              name="Factura_aceptada"
              checked={formData.Factura_aceptada}
              onChange={(e) => setFormData({ ...formData, Factura_aceptada: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="Factura_aceptada" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Factura Aceptada</label>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="checkbox"
              id="Factura_CRC"
              name="Factura_CRC"
              checked={formData.Factura_CRC}
              onChange={(e) => setFormData({ ...formData, Factura_CRC: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="Factura_CRC" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Factura CRC</label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto text-xs sm:text-sm">
            {saving ? 'Guardando...' : '✅ Crear Factura'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/facturas')} className="w-full sm:w-auto text-xs sm:text-sm">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FacturasNew
