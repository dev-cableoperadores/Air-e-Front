import api from '../utils/api'

const contratosService = {
  // Devuelve la respuesta completa (count, next, results...)
  getAllFull: async (params = {}) => {
    const response = await api.get('/api/contratos/list/', { params })
    return response.data
  },

  // Compatibilidad: devuelve solo el array de items
  getAll: async (params = {}) => {
    const data = await contratosService.getAllFull(params)
    return data?.results || []
  },

  // Trae todas las páginas concatenadas
  getAllAllPages: async (params = {}) => {
    const accumulated = []
    let url = '/api/contratos/list/'
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
    const response = await api.get(`/api/contratos/detail/${id}/`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/contratos/list/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/api/contratos/detail/${id}/`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/contratos/detail/${id}/`)
    return response.data
  },
}

export default contratosService

