import api from '../utils/api'

const acuerdoService = {
  // Acuerdos de pago
  getAll: async (params = {}) => {
    const response = await api.get('/api/facturas/acuerdos/', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/api/facturas/acuerdos/${id}/`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/facturas/acuerdos/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/api/facturas/acuerdos/${id}/`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/facturas/acuerdos/${id}/`)
    return response.data
  },

  // Obtener acuerdo por factura
  getByFactura: async (facturaId) => {
    const response = await api.get(`/api/facturas/acuerdos/?facturacion=${facturaId}`)
    return response.data.results ? response.data.results[0] : null
  },
}

export default acuerdoService