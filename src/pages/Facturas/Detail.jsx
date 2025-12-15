import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Modal from '../../components/UI/Modal'
import { formatPhone, formatNumber, formatDate, formatMonthYear, formatMonthYearString, convertMonthToDate, convertDateToMonth } from '../../utils/formatters'

const FacturasDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [factura, setFactura] = useState(null)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [pagoForm, setPagoForm] = useState({
    fecha_pago: new Date().toISOString().split('T')[0],
    periodo_pago: '',
    monto_pagado: '',
    fecha_aplicacion: '',
    fecha_confirmacion: '',
    fecha_indicador_recaudo: '',
    factura_interes: false,
    interes_gravado_iva: false,
    observaciones: '',
  })
  const [savingPago, setSavingPago] = useState(false)
  const [editingPago, setEditingPago] = useState(null)

  useEffect(() => {
    loadFactura()
  }, [id])

  const loadFactura = async () => {
    try {
      setLoading(true)
      const data = await facturasService.getById(id)
      setFactura(data)
    } catch (error) {
      toast.error('Error al cargar factura')
      navigate('/facturas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar esta factura?`)) {
      try {
        await facturasService.delete(id)
        toast.success('Factura eliminada')
        navigate('/facturas')
      } catch (error) {
        toast.error('Error al eliminar factura')
      }
    }
  }

  const handlePagoChange = (e) => {
    const { name, value } = e.target
    setPagoForm({ ...pagoForm, [name]: value })
  }

  const handleEditPago = (pago) => {
    setEditingPago(pago)
    setPagoForm({
      fecha_pago: pago.fecha_pago,
      periodo_pago: convertDateToMonth(pago.periodo_pago),
      monto_pagado: pago.monto_pagado.toString(),
      fecha_aplicacion: pago.fecha_aplicacion || '',
      fecha_confirmacion: pago.fecha_confirmacion || '',
      fecha_indicador_recaudo: convertDateToMonth(pago.fecha_indicador_recaudo),
      factura_interes: pago.factura_interes || false,
      interes_gravado_iva: pago.interes_gravado_iva || false,
      observaciones: pago.observaciones || '',
    })
    setShowPagoModal(true)
  }

  const handleAddPago = async (e) => {
    e.preventDefault()

    if (!pagoForm.monto_pagado) {
      toast.error('Ingresa el monto pagado')
      return
    }

    setSavingPago(true)

    try {
      const dataToSend = {
        fecha_pago: pagoForm.fecha_pago,
        periodo_pago: convertMonthToDate(pagoForm.periodo_pago),
        monto_pagado: parseFloat(pagoForm.monto_pagado),
        observaciones: pagoForm.observaciones,
        facturacion: parseInt(id),
        ...(pagoForm.fecha_aplicacion && { fecha_aplicacion: pagoForm.fecha_aplicacion }),
        ...(pagoForm.fecha_confirmacion && { fecha_confirmacion: pagoForm.fecha_confirmacion }),
        ...(pagoForm.fecha_indicador_recaudo && { fecha_indicador_recaudo: convertMonthToDate(pagoForm.fecha_indicador_recaudo) }),
        factura_interes: pagoForm.factura_interes,
        interes_gravado_iva: pagoForm.interes_gravado_iva,
      }

      if (editingPago) {
        // Actualizar pago existente
        await facturasService.updatePago(editingPago.id, dataToSend)
        toast.success('Pago actualizado exitosamente')
      } else {
        // Crear nuevo pago
        await facturasService.createPago(dataToSend)
        toast.success('Pago registrado exitosamente')
      }

      setShowPagoModal(false)
      setPagoForm({
        fecha_pago: new Date().toISOString().split('T')[0],
        periodo_pago: '',
        monto_pagado: '',
        fecha_aplicacion: '',
        fecha_confirmacion: '',
        fecha_indicador_recaudo: '',
        factura_interes: false,
        interes_gravado_iva: false,
        observaciones: '',
      })
      setEditingPago(null)
      loadFactura()
    } catch (error) {
      const resp = error?.response
      const serverData = resp?.data
      let message = editingPago ? 'Error al actualizar pago' : 'Error al registrar pago'
      if (serverData) {
        if (typeof serverData === 'string') {
          message = serverData
        } else if (serverData.detail) {
          message = serverData.detail
        } else {
          try {
            const parts = []
            for (const [k, v] of Object.entries(serverData)) {
              parts.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            }
            if (parts.length) message = parts.join(' | ')
          } catch (e) {
            message = JSON.stringify(serverData)
          }
        }
      }
      toast.error(message)
    } finally {
      setSavingPago(false)
    }
  }

  const handleDeletePago = async (pagoId) => {
    if (window.confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await facturasService.deletePago(pagoId)
        toast.success('Pago eliminado')
        loadFactura()
      } catch (error) {
        toast.error('Error al eliminar pago')
      }
    }
  }

  if (loading) {
    return <Loading fullScreen />
  }

  if (!factura) {
    return <div>Factura no encontrada</div>
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'Pendiente': 'text-yellow-600 bg-yellow-50',
      'PagadaParcial': 'text-blue-600 bg-blue-50',
      'Pagada': 'text-green-600 bg-green-50',
      'Anulada': 'text-red-600 bg-red-50',
    }
    return colors[estado] || 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalle Factura</h2>
        <div className="flex gap-2">
          <Link to={`/facturas/${id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
          <Link to="/facturas">
            <Button variant="outline">Volver</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Encabezado */}
        <div className="bg-secondary text-white rounded-lg p-4 mb-6">
          <h3 className="bg-black text-2xl font-bold text-center"> {factura.cableoperador?.nombre_largo || 'N/A'}</h3>
          <p className="text-center mt-2 opacity-90">
            Factura N° {factura.Num_factura}
          
          </p>
        </div>

        {/* Información de la factura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailField label="Mes de Uso" value={formatMonthYearString(factura.Mes_uso)} />
          <DetailField label="Fecha Facturación" value={formatDate(factura.Fecha_facturacion)} />
          <DetailField label="Fecha Vencimiento" value={formatDate(factura.Fecha_vencimiento)} />
          <DetailField label="Período Vencimiento" value={formatMonthYearString(factura.Periodo_vencimiento)} />
          <DetailField label="Valor Facturado (IVA)" value={`$${formatNumber(factura.Valor_facturado_iva)}`} />
          <DetailField label="Estado" value={
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(factura.estado)}`}>
              {factura.estado}
            </span>
          } />
          <DetailField label="Factura Aceptada" value={factura.Factura_aceptada ? 'Sí' : 'No'} />
          <DetailField label="Factura CRC" value={factura.Factura_CRC ? 'Sí' : 'No'} />
        </div>

        {/* Resumen de pagos */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de Pagos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Monto Pagado</p>
              <p className="text-2xl font-bold text-blue-600">${formatNumber(factura.monto_pagado)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Monto Pendiente</p>
              <p className="text-2xl font-bold text-red-600">${formatNumber(factura.monto_pendiente)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valor Facturado</p>
              <p className="text-2xl font-bold text-green-600">${formatNumber(factura.Valor_facturado_iva)}</p>
            </div>
          </div>
        </div>

        {/* Tabla de pagos */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Registros de Pago ({factura.pagos?.length || 0})</h3>
            <Button
              variant="primary"
              onClick={() => setShowPagoModal(true)}
            >
              + Registrar Pago
            </Button>
          </div>

          {factura.pagos && factura.pagos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fecha Pago
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Período Pago
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Monto Pagado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fecha Aplicacion
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fecha Confirmación
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Fecha Indicador Recaudo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Factura Interés
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Interés Gravado IVA
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {factura.pagos.map((pago) => (
                    <tr key={pago.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(pago.fecha_pago)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatMonthYearString(pago.periodo_pago)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        ${formatNumber(pago.monto_pagado)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(pago.fecha_aplicacion || '-')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(pago.fecha_confirmacion || '-')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {pago.observaciones || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatMonthYearString(pago.fecha_indicador_recaudo)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {pago.factura_interes ? 'Sí' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {pago.interes_gravado_iva ? 'Sí' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditPago(pago)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeletePago(pago.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
          )}
        </div>
      </div>

      {/* Modal para registrar/editar pago */}
      <Modal
        isOpen={showPagoModal}
        onClose={() => {
          setShowPagoModal(false)
          setEditingPago(null)
          setPagoForm({
            fecha_pago: new Date().toISOString().split('T')[0],
            periodo_pago: '',
            monto_pagado: '',
            fecha_aplicacion: '',
            fecha_confirmacion: '',
            fecha_indicador_recaudo: '',
            factura_interes: false,
            interes_gravado_iva: false,
            observaciones: '',
          })
        }}
        title={editingPago ? "Editar Pago" : "Registrar Pago"}
      >
        <form onSubmit={handleAddPago} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha Pago"
              name="fecha_pago"
              type="date"
              value={pagoForm.fecha_pago}
              onChange={handlePagoChange}
              required
            />
            <Input
                label="Período Pago"
                name="periodo_pago"
                type="month"
                value={pagoForm.periodo_pago}
                onChange={handlePagoChange}
                required
              />
            <Input
              label="Fecha Indicador Recaudo"
              name="fecha_indicador_recaudo"
              type="month"
              value={pagoForm.fecha_indicador_recaudo}
              onChange={handlePagoChange}
            />
            <Input
              label="Fecha Aplicación"
              name="fecha_aplicacion"
              type="date"
              value={pagoForm.fecha_aplicacion}
              onChange={handlePagoChange}
            />
            <Input
              label="Fecha Confirmación"
              name="fecha_confirmacion"
              type="date"
              value={pagoForm.fecha_confirmacion}
              onChange={handlePagoChange}
            />
            <Input
              label="Monto Pagado"
              name="monto_pagado"
              type="number"
              step="0.01"
              value={pagoForm.monto_pagado}
              onChange={handlePagoChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="factura_interes"
                name="factura_interes"
                checked={pagoForm.factura_interes}
                onChange={(e) => setPagoForm({ ...pagoForm, factura_interes: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="factura_interes" className="text-sm font-medium text-gray-700">Factura Interés</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="interes_gravado_iva"
                name="interes_gravado_iva"
                checked={pagoForm.interes_gravado_iva}
                onChange={(e) => setPagoForm({ ...pagoForm, interes_gravado_iva: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="interes_gravado_iva" className="text-sm font-medium text-gray-700">Interés Gravado IVA</label>
            </div>
          </div>
          <Input
            label="Observaciones"
            name="observaciones"
            type="text"
            value={pagoForm.observaciones}
            onChange={handlePagoChange}
            placeholder="Ej: Pago por transferencia bancaria"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={savingPago}
            >
              {savingPago ? 'Guardando...' : (editingPago ? 'Actualizar Pago' : 'Registrar Pago')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPagoModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

const DetailField = ({ label, value }) => (
  <div>
    <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
    <p className="text-base text-gray-900">{value}</p>
  </div>
)

export default FacturasDetail
