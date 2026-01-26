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
  // Crear nuevo inspector
  create: async (data) => {
    const response = await api.post('/api/inspectores/', data);
    return response.data;
  },

  // Actualizar inspector
  update: async (id, data) => {
    const response = await api.put(`/api/inspectores/${id}/`, data);
    return response.data;
  },

  // Eliminar inspector
  delete: async (id) => {
    const response = await api.delete(`/api/inspectores/${id}/`);
    return response.data;
  },
}

export default inspectoresService
