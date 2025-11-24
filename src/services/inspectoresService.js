import api from '../utils/api'

const inspectoresService = {
  getAllFull: async (params = {}) => {
    const response = await api.get('/api/inspectores/', { params })
    return response.data
  },
  getAll: async (params = {}) => {
    const data = await inspectoresService.getAllFull(params)
    return data?.results || []
  },
  getById: async (id) => {
    const response = await api.get(`/api/inspectores/${id}/`)
    return response.data
  },
}

export default inspectoresService
