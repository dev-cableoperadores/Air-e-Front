import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { formatDateForInput, convertMonthToDate, addOneMonth, convertDateToMonth } from '../../utils/formatters'
import { ca } from 'date-fns/locale'

const FacturasEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cableoperadores, setCableoperadores] = useState([])
  const [formData, setFormData] = useState({
    cableoperador: '',
    Mes_uso: '',
    Fecha_facturacion: '',
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
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [facturaData, cableoperadoresData] = await Promise.all([
        facturasService.getById(id),
        cableoperadoresService.getAllFull(),
      ])

      const items = Array.isArray(cableoperadoresData?.results)
        ? cableoperadoresData.results
        : (cableoperadoresData || [])

      setCableoperadores(items)

      if (!facturaData) {
        throw new Error('No se pudo cargar la factura')
      }

      setFormData({
        ...facturaData,
        cableoperador: facturaData.cableoperador?.id?.toString() || '',
        Valor_facturado_iva: facturaData.Valor_facturado_iva?.toString() || '',
        Valor_iva_millones: facturaData.Valor_iva_millones?.toString() || '',
        Mes_uso: facturaData.Mes_uso ? facturaData.Mes_uso.slice(0, 7) : '',
        Fecha_facturacion: formatDateForInput(facturaData.Fecha_facturacion),
        Fecha_vencimiento: formatDateForInput(facturaData.Fecha_vencimiento),
        Periodo_vencimiento: formatDateForInput(facturaData.Periodo_vencimiento),
      })
    } catch (error) {
      toast.error('Error al cargar factura')
      navigate('/facturas')
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
        Periodo_vencimiento: formData.Periodo_vencimiento,
        estado: formData.estado,
        Factura_aceptada: formData.Factura_aceptada,
        Factura_CRC: formData.Factura_CRC,
      }

      await facturasService.update(id, dataToSend)
      toast.success('Factura actualizada exitosamente')
      navigate('/facturas')
    } catch (error) {
      toast.error('Error al actualizar factura')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Factura</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableSelect
            label="Cableoperador"
            name="cableoperador"
            value={formData.cableoperador}
            onChange={handleChange}
            options={cableoperadores.map((c) => ({
              value: c.id.toString(),
              label: `${c.nombre_largo || c.nombre} - ${c.id || 'Sin referencia'}`,
            }))}
            required
          />
          <Input
            label="Número de Factura"
            name="Num_factura"
            type="text"
            value={formData.Num_factura}
            onChange={handleChange}
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
              // Esto asegura que si formData.Periodo_vencimiento es '2026-01-01', el valor sea '2026-01'
              value={convertDateToMonth(formData.Periodo_vencimiento)} 
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
              { value: 'Acuerdo de pago', label: 'Acuerdo de pago' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="Factura_aceptada"
              name="Factura_aceptada"
              checked={formData.Factura_aceptada}
              onChange={(e) => setFormData({ ...formData, Factura_aceptada: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="Factura_aceptada" className="text-sm font-medium text-gray-700">Factura Aceptada</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="Factura_CRC"
              name="Factura_CRC"
              checked={formData.Factura_CRC}
              onChange={(e) => setFormData({ ...formData, Factura_CRC: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="Factura_CRC" className="text-sm font-medium text-gray-700">Factura CRC</label>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Actualizar Factura'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/facturas')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FacturasEdit
