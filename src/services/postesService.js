import api from '../utils/api'

const postesService = {
  // Obtener todos los postes
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/postes/', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching postes:', error)
      throw error
    }
  },

  // Obtener postes por cableoperador
  getByCableoperador: async (cableoperadorId) => {
    try {
      const response = await api.get(`/api/postes/cableoperador/${cableoperadorId}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching postes for cableoperador ${cableoperadorId}:`, error)
      throw error
    }
  },

  // Obtener un poste específico
  getById: async (id) => {
    try {
      const response = await api.get(`/api/postes/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching poste ${id}:`, error)
      throw error
    }
  },

  // Crear un nuevo poste
  create: async (data) => {
    try {
      const response = await api.post('/api/postes/', data)
      return response.data
    } catch (error) {
      console.error('Error creating poste:', error)
      throw error
    }
  },

  // Actualizar un poste
  update: async (id, data) => {
    try {
      const response = await api.put(`/api/postes/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Error updating poste ${id}:`, error)
      throw error
    }
  },

  // Eliminar un poste
  delete: async (id) => {
    try {
      await api.delete(`/api/postes/${id}`)
    } catch (error) {
      console.error(`Error deleting poste ${id}:`, error)
      throw error
    }
  },
}

export default postesService
