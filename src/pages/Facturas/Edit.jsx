import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import contratosService from '../../services/contratosService'
import Input from '../../components/UI/Input'
import Select from '../../components/UI/Select'
import SearchableSelect from '../../components/UI/SearchableSelect'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { formatDateForInput, convertMonthToDate, addOneMonth } from '../../utils/formatters'

const FacturasEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contratos, setContratos] = useState([])
  const [formData, setFormData] = useState({
    contratos: '',
    Mes_uso: '',
    Fecha_facturacion: '',
    Num_factura: '',
    Valor_facturado_iva: '',
    Valor_iva_millones: '',
    Fecha_vencimiento: '',
    Periodo_vencimiento: '',
    estado: 'Pendiente',
    monto_total: '0',
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [facturaData, contratosData] = await Promise.all([
        facturasService.getById(id),
        contratosService.getAllFull(),
      ])

      const items = Array.isArray(contratosData?.results)
        ? contratosData.results
        : (contratosData || [])

      setContratos(items)

      if (!facturaData) {
        throw new Error('No se pudo cargar la factura')
      }

      setFormData({
        ...facturaData,
        contratos: facturaData.contratos?.id?.toString() || facturaData.contratos?.toString() || '',
        Valor_facturado_iva: facturaData.Valor_facturado_iva?.toString() || '',
        Valor_iva_millones: facturaData.Valor_iva_millones?.toString() || '',
        monto_total: facturaData.monto_total?.toString() || '0',
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

    if (!formData.contratos || !formData.Num_factura) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    setSaving(true)

    try {
      const dataToSend = {
        ...formData,
        contratos: parseInt(formData.contratos),
        Valor_facturado_iva: parseFloat(formData.Valor_facturado_iva) || 0,
        Valor_iva_millones: parseFloat(formData.Valor_iva_millones) || 0,
        monto_total: parseFloat(formData.monto_total) || 0,
        Mes_uso: convertMonthToDate(formData.Mes_uso),
        Periodo_vencimiento: convertMonthToDate(formData.Periodo_vencimiento),
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
            label="Contrato"
            name="contratos"
            value={formData.contratos}
            onChange={handleChange}
            options={contratos.map((c) => ({
              value: c.id.toString(),
              label: `${c.cableoperador?.nombre_largo || c.cableoperador?.nombre} - ${c.id || 'Sin referencia'}`,
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
          <Input
            label="Monto Total"
            name="monto_total"
            type="number"
            step="0.01"
            value={formData.monto_total}
            onChange={handleChange}
          />
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
