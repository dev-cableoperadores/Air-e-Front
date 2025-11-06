import api from '../utils/api'

const cableoperadoresService = {
  // Devuelve la respuesta completa (útil para leer count, next, previous)
  getAllFull: async (params = {}) => {
    const response = await api.get('/api/cableoperadores/list/', { params })
    return response.data
  },

  // Devuelve solo el array de results (compatibilidad con llamadas existentes)
  getAll: async (params = {}) => {
    const data = await cableoperadoresService.getAllFull(params)
    return data?.results || []
  },

  // Trae todos los items iterando páginas (use con cuidado - puede ser lento)
  getAllAllPages: async (params = {}) => {
    const accumulated = []
    let url = '/api/cableoperadores/list/'
    let query = { ...params }

    // First request
    let response = await api.get(url, { params: query })
    const firstData = response.data
    accumulated.push(...(firstData.results || []))
    let next = firstData.next

    // Iterate following pages
    while (next) {
      // next is a full URL; call it directly
      response = await api.get(next)
      const pageData = response.data
      accumulated.push(...(pageData.results || []))
      next = pageData.next
    }

    return { results: accumulated, count: firstData.count }
  },

  getById: async (id) => {
    const response = await api.get(`/api/cableoperadores/detail/${id}/`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/api/cableoperadores/list/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/api/cableoperadores/detail/${id}/`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/cableoperadores/detail/${id}/`)
    return response.data
  },
  // trae todas las notificaciones de un cableoperador
  getNotificaciones: async (id) => {
    const response = await api.get(`/api/cableoperadores/${id}/notificaciones/`)
    return response.data
  },
  // trae todas las notificaciones de un cableoperador
  postNotificaciones: async (id, data) => {
    const response = await api.post(`/api/cableoperadores/${id}/notificaciones/`, data)
    
    return response.data
  },
}

export default cableoperadoresService

