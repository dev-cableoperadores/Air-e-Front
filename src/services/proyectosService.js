import api from '../utils/api'

const proyectosService = {
  // IngresoProyecto endpoints
  getIngresoAllFull: async (params = {}) => {
    const response = await api.get('/api/proyectos/ingreso/', { params })
    return response.data
  },
  getIngresoNoVinculated: async (params = {}) => {
    const response = await api.get('/api/proyectos/ingreso-no-vinculados/', { params })
    return response.data
  },
  getIngresoAll: async (params = {}) => {
    const data = await proyectosService.getIngresoAllFull(params)
    return data?.results || []
  },
  getIngresoNoVinculatedAll: async (params = {}) => {
    const data = await proyectosService.getIngresoNoVinculated(params)
    return data?.results || []
  },
  // Obtiene todos los ingresos que no han sido vinculados con un proyecto

  getIngresoById: async (id) => {
    const response = await api.get(`/api/proyectos/ingreso/${id}/`)
    return response.data
  },
  createIngreso: async (data) => {
    const response = await api.post('/api/proyectos/ingreso/', data)
    return response.data
  },
  updateIngreso: async (id, data) => {
    const response = await api.put(`/api/proyectos/ingreso/${id}/`, data)
    return response.data
  },
  deleteIngreso: async (id) => {
    const response = await api.delete(`/api/proyectos/ingreso/${id}/`)
    return response.data
  },

  // Proyectos endpoints
  getProyectosListFull: async (params = {}) => {
    const response = await api.get('/api/proyectos/list/', { params })
    return response.data
  },
  getProyectoById: async (id) => {
    const response = await api.get(`/api/proyectos/${id}/`)
    return response.data
  },
  createProyecto: async (data) => {
    const response = await api.post('/api/proyectos/list/', data)
    return response.data
  },
  updateProyecto: async (id, data) => {
    const response = await api.put(`/api/proyectos/${id}/`, data)
    return response.data
  },
  deleteProyecto: async (id) => {
    const response = await api.delete(`/api/proyectos/${id}/`)
    return response.data
  },
}

export default proyectosService
