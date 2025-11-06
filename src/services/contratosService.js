import api from '../utils/api'

const contratosService = {
  // Devuelve la respuesta completa (count, next, results...)
  getAllFull: async (params = {}) => {
    // Normalizar y limpiar params para evitar valores inválidos que provoquen 400
    const safeParams = {}
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (typeof v === 'string') {
        const trimmed = v.trim()
        if (trimmed === '') return
        // Manejar casos donde venga con prefijo ':' (ej. ':1') por accidente
        const withoutColon = trimmed.startsWith(':') ? trimmed.slice(1) : trimmed
        // Si es un número en string, convertir a Number
        if (/^-?\d+$/.test(withoutColon)) {
          safeParams[k] = Number(withoutColon)
        } else {
          safeParams[k] = withoutColon
        }
        return
      }
      // Pasar números y booleanos directamente
      safeParams[k] = v
    })

    const response = await api.get('/api/contratos/list/', { params: safeParams })
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
    // Primero intentar obtener por la ruta detail
    try {
      const response = await api.get(`/api/contratos/list/${id}/`)
      return response.data
    } catch (error) {
      // Si falla, buscar en la lista filtrada
      const response = await api.get(`/api/contratos/list/`, { 
        params: { id: id }
      })
      // Tomar el primer resultado que coincida
      const contrato = response.data?.results?.find(c => c.id.toString() === id.toString())
      if (!contrato) {
        throw new Error('Contrato no encontrado')
      }
      return contrato
    }
  },

  create: async (data) => {
    const response = await api.post('/api/contratos/list/', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/api/contratos/list/${id}/`, {
      ...data,
      _method: 'PUT', // Simular PUT vía POST para evitar 405
    })
    return response.data
  },

  delete: async (id) => {
    const response = await api.post(`/api/contratos/list/${id}/`, {
      _method: 'DELETE', // Simular DELETE vía POST
    })
    return response.data
  },
}

export default contratosService