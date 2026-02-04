import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import facturasService from '../../services/facturasService'
import acuerdoService from '../../services/acuerdoService'
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
    fecha_pago_indicador_recaudo: '',
    factura_interes: true,
    interes_gravado_iva: true,
    observaciones: '',
  })
  const [savingPago, setSavingPago] = useState(false)
  const [editingPago, setEditingPago] = useState(null)
  const [acuerdo, setAcuerdo] = useState(null)
  const [showAcuerdoModal, setShowAcuerdoModal] = useState(false)
  const [acuerdoForm, setAcuerdoForm] = useState({
    fecha_acuerdo: new Date().toISOString().split('T')[0],
    monto_acuerdo: '',
    fecha_pago_acuerdo: '',
    numero_cuotas: 1,
    observaciones: '',
  })
  const [savingAcuerdo, setSavingAcuerdo] = useState(false)

  useEffect(() => {
    loadFactura()
  }, [id])

  const loadFactura = async () => {
    try {
      setLoading(true)
      const data = await facturasService.getById(id)
      setFactura(data)
      const acuerdoData = await acuerdoService.getByFactura(id)
      setAcuerdo(acuerdoData)
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
  const { name, value } = e.target;
  
  // 1. Creamos la copia del estado actual con el nuevo valor
  let newPagoForm = { ...pagoForm, [name]: value };

  // 2. Si el usuario cambia la "fecha_pago", actualizamos el "periodo_pago"
  if (name === 'fecha_pago' && value) {
    // value viene como "YYYY-MM-DD", tomamos solo los primeros 7 caracteres "YYYY-MM"
    newPagoForm.periodo_pago = value.substring(0, 7);
  }

  // 3. Actualizamos el estado una sola vez
  setPagoForm(newPagoForm);
};

  const handleEditPago = (pago) => {
    setEditingPago(pago)
    setPagoForm({
      fecha_pago: pago.fecha_pago,
      periodo_pago: convertDateToMonth(pago.periodo_pago),
      monto_pagado: pago.monto_pagado.toString(),
      fecha_aplicacion: pago.fecha_aplicacion || '',
      fecha_confirmacion: pago.fecha_confirmacion || '',
      fecha_indicador_recaudo: convertDateToMonth(pago.fecha_indicador_recaudo),
      fecha_pago_indicador_recaudo: pago.fecha_pago_indicador_recaudo || '',
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
        monto_pagado: pagoForm.monto_pagado,
        observaciones: pagoForm.observaciones,
        facturacion: parseInt(id),
        ...(pagoForm.fecha_aplicacion && { fecha_aplicacion: pagoForm.fecha_aplicacion }),
        ...(pagoForm.fecha_confirmacion && { fecha_confirmacion: pagoForm.fecha_confirmacion }),
        ...(pagoForm.fecha_indicador_recaudo && { fecha_indicador_recaudo: convertMonthToDate(pagoForm.fecha_indicador_recaudo) }),
        ...(pagoForm.fecha_pago_indicador_recaudo && { fecha_pago_indicador_recaudo: pagoForm.fecha_pago_indicador_recaudo }),
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
        fecha_pago_indicador_recaudo: '',
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

  const handleAcuerdoChange = (e) => {
    const { name, value } = e.target
    setAcuerdoForm({ ...acuerdoForm, [name]: value })
  }

  const handleAddAcuerdo = async (e) => {
    e.preventDefault()

    if (!acuerdoForm.monto_acuerdo) {
      toast.error('Ingresa el monto del acuerdo')
      return
    }

    setSavingAcuerdo(true)

    try {
      const dataToSend = {
        facturacion: parseInt(id),
        fecha_acuerdo: acuerdoForm.fecha_acuerdo,
        monto_acuerdo: acuerdoForm.monto_acuerdo,
        numero_cuotas: acuerdoForm.numero_cuotas,
        observaciones: acuerdoForm.observaciones,
        ...(acuerdoForm.fecha_pago_acuerdo && { fecha_pago_acuerdo: acuerdoForm.fecha_pago_acuerdo }),
      }

      if (acuerdo) {
        // Actualizar acuerdo existente
        await acuerdoService.update(acuerdo.id, dataToSend)
        toast.success('Acuerdo actualizado exitosamente')
      } else {
        // Crear nuevo acuerdo
        await acuerdoService.create(dataToSend)
        toast.success('Acuerdo registrado exitosamente')
      }

      setShowAcuerdoModal(false)
      setAcuerdoForm({
        fecha_acuerdo: new Date().toISOString().split('T')[0],
        monto_acuerdo: '',
        fecha_pago_acuerdo: '',
        numero_cuotas: 1,
        observaciones: '',
      })
      loadFactura()
    } catch (error) {
      const resp = error?.response
      const serverData = resp?.data
      let message = acuerdo ? 'Error al actualizar acuerdo' : 'Error al registrar acuerdo'
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
      setSavingAcuerdo(false)
    }
  }

  const handleEditAcuerdo = () => {
    setAcuerdoForm({
      fecha_acuerdo: acuerdo.fecha_acuerdo,
      monto_acuerdo: acuerdo.monto_acuerdo.toString(),
      fecha_pago_acuerdo: acuerdo.fecha_pago_acuerdo || '',
      numero_cuotas: acuerdo.numero_cuotas,
      observaciones: acuerdo.observaciones || '',
    })
    setShowAcuerdoModal(true)
  }

  const handleDeleteAcuerdo = async () => {
    if (window.confirm('¿Estás seguro de eliminar este acuerdo de pago?')) {
      try {
        await acuerdoService.delete(acuerdo.id)
        toast.success('Acuerdo eliminado')
        setAcuerdo(null)
      } catch (error) {
        toast.error('Error al eliminar acuerdo')
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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Detalle Factura</h2>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <Link to={`/facturas/${id}/editar`}>
            <Button variant="secondary" className="w-full sm:w-auto text-xs sm:text-sm">✏️ Editar</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto text-xs sm:text-sm">
            🗑️ Eliminar
          </Button>
          <Link to="/facturas">
            <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">← Volver</Button>
          </Link>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center">{factura.cableoperador?.nombre_largo || 'N/A'}</h3>
          <p className="text-center mt-2 text-xs sm:text-sm md:text-base opacity-90">
            📄 Factura N° {factura.Num_factura}
          </p>
        </div>

        {/* Información de la factura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
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
          <DetailField label="Acuerdo de Pago" value={factura.acuerdo_pago ? 'Sí' : 'No'} />
        </div>

        {/* Resumen de pagos */}
        <div className="border-t border-blue-200 dark:border-blue-600 pt-4 sm:pt-6">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Resumen de Pagos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monto Pagado</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">${formatNumber(factura.monto_pagado)}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Monto Pendiente</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">${formatNumber(factura.monto_pendiente)}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Valor Facturado</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">${formatNumber(factura.Valor_facturado_iva)}</p>
            </div>
          </div>
        </div>

        {/* Registros de pagos - Diseño de tarjetas */}
        <div className="border-t border-blue-200 dark:border-blue-600 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">Registros de Pago ({factura.pagos?.length || 0})</h3>
            <Button
              variant="primary"
              onClick={() => setShowPagoModal(true)}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              + Registrar Pago
            </Button>
          </div>

          {factura.pagos && factura.pagos.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {factura.pagos.map((pago) => (
                <div key={pago.id} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:bg-gray-900/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Fecha Pago</p>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100">{formatDate(pago.fecha_pago)}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Monto</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">${formatNumber(pago.monto_pagado)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Período Pago</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{formatMonthYearString(pago.periodo_pago)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Indicador</p>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{pago.fecha_indicador_recaudo ? formatMonthYearString(pago.fecha_indicador_recaudo) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Aplicación</p>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{pago.fecha_aplicacion ? formatDate(pago.fecha_aplicacion) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Confirmación</p>
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{pago.fecha_confirmacion ? formatDate(pago.fecha_confirmacion) : '-'}</p>
                    </div>
                  </div>
                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Fecha Pago Indicador</p>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">{pago.fecha_pago_indicador_recaudo ? formatDate(pago.fecha_pago_indicador_recaudo) : '-'}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-gray-600">Factura Interés</p>
                      <p className="text-sm font-medium">{pago.factura_interes ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600">Interés Gravado IVA</p>
                      <p className="text-sm font-medium">{pago.interes_gravado_iva ? 'Sí' : 'No'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-gray-600">Observaciones</p>
                      <p className="text-sm text-gray-700">{pago.observaciones || '-'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
          )}
        </div>

        {/* Acuerdo de pago */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Acuerdo de Pago</h3>
            {acuerdo ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleEditAcuerdo}
                >
                  Editar Acuerdo
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAcuerdo}
                >
                  Eliminar Acuerdo
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => setShowAcuerdoModal(true)}
              >
                + Crear Acuerdo
              </Button>
            )}
          </div>

          {acuerdo ? (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailField label="Fecha de Acuerdo" value={formatDate(acuerdo.fecha_acuerdo)} />
                <DetailField label="Monto del Acuerdo" value={`$${formatNumber(acuerdo.monto_acuerdo)}`} />
                <DetailField label="Fecha de Pago del Acuerdo" value={acuerdo.fecha_pago_acuerdo ? formatDate(acuerdo.fecha_pago_acuerdo) : '-'} />
                <DetailField label="Número de Cuotas" value={acuerdo.numero_cuotas} />
                <div className="md:col-span-2">
                  <DetailField label="Observaciones" value={acuerdo.observaciones || '-'} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay acuerdo de pago registrado</p>
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
              label="Monto Pagado"
              name="monto_pagado"
              type="number"
              step="0.01"
              value={pagoForm.monto_pagado}
              onChange={handlePagoChange}
              required
            />
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
                label="Fecha Aplicación"
                name="fecha_aplicacion"
                type="date"
                value={pagoForm.fecha_aplicacion}
                onChange={handlePagoChange}
              />
            <Input
              label="Fecha Indicador Recaudo"
              name="fecha_indicador_recaudo"
              type="month"
              value={pagoForm.fecha_indicador_recaudo}
              onChange={handlePagoChange}
            />
            <Input
              label="Fecha Pago Indicador Recaudo"
              name="fecha_pago_indicador_recaudo"
              type="date"
              value={pagoForm.fecha_pago_indicador_recaudo}
              onChange={handlePagoChange}
            />
            <Input
              label="Fecha Confirmación"
              name="fecha_confirmacion"
              type="date"
              value={pagoForm.fecha_confirmacion}
              onChange={handlePagoChange}
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

      {/* Modal para registrar/editar acuerdo */}
      <Modal
        isOpen={showAcuerdoModal}
        onClose={() => {
          setShowAcuerdoModal(false)
          setAcuerdoForm({
            fecha_acuerdo: new Date().toISOString().split('T')[0],
            monto_acuerdo: '',
            fecha_pago_acuerdo: '',
            numero_cuotas: 1,
            observaciones: '',
          })
        }}
        title={acuerdo ? "Editar Acuerdo de Pago" : "Crear Acuerdo de Pago"}
      >
        <form onSubmit={handleAddAcuerdo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Acuerdo"
              name="fecha_acuerdo"
              type="date"
              value={acuerdoForm.fecha_acuerdo}
              onChange={handleAcuerdoChange}
              required
            />
            <Input
              label="Monto del Acuerdo"
              name="monto_acuerdo"
              type="number"
              step="0.01"
              value={acuerdoForm.monto_acuerdo}
              onChange={handleAcuerdoChange}
              required
            />
            <Input
              label="Fecha de Pago del Acuerdo"
              name="fecha_pago_acuerdo"
              type="date"
              value={acuerdoForm.fecha_pago_acuerdo}
              onChange={handleAcuerdoChange}
            />
            <Input
              label="Número de Cuotas"
              name="numero_cuotas"
              type="number"
              min="1"
              value={acuerdoForm.numero_cuotas}
              onChange={handleAcuerdoChange}
              required
            />
          </div>
          <Input
            label="Observaciones"
            name="observaciones"
            type="textarea"
            value={acuerdoForm.observaciones}
            onChange={handleAcuerdoChange}
            placeholder="Observaciones del acuerdo"
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={savingAcuerdo}
            >
              {savingAcuerdo ? 'Guardando...' : (acuerdo ? 'Actualizar Acuerdo' : 'Crear Acuerdo')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAcuerdoModal(false)}
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
