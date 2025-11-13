import api from '../utils/api'

const facturasService = {
  // Facturas
  getAllFull: async (params = {}) => {
    const response = await api.get('/api/facturas/', { params })
    return response.data
  },

  getAll: async (params = {}) => {
    const data = await facturasService.getAllFull(params)
    return data?.results || []
  },

  getAllAllPages: async (params = {}) => {
    const accumulated = []
    let url = '/api/facturas/'
    let query = { ...params }

    let response = await api.get(url, { params: query })
    const firstData = response.data
    accumulated.push(...(firstData.results || []))
    let next = firstData.next

    while (next) {
      response = await api.get(next)
      const pageData = response.data
      accumulated.push(...(pageData.results || []))
      next = pageData.next
    }

    return { results: accumulated, count: firstData.count }
  },

  getById: async (id) => {
    const response = await api.get(`/api/facturas/${id}/`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/facturas/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/api/facturas/${id}/`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/facturas/${id}/`)
    return response.data
  },

  // Registros de pago
  getAllPagos: async (params = {}) => {
    const response = await api.get('/api/pagos/', { params })
    return response.data
  },

  getPagoById: async (id) => {
    const response = await api.get(`/api/facturas/pagos/${id}/`)
    return response.data
  },

  createPago: async (data) => {
    const response = await api.post('/api/facturas/pagos/', data)
    return response.data
  },

  updatePago: async (id, data) => {
    const response = await api.put(`/api/facturas/pagos/${id}/`, data)
    return response.data
  },

  deletePago: async (id) => {
    const response = await api.delete(`/api/facturas/pagos/${id}/`)
    return response.data
  },
}

export default facturasService
