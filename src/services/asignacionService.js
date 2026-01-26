// services/asignacionService.js
import api from '../utils/api';

const asignacionService = {
  // Obtener todos los proyectos de inspección
  getAll: async () => {
    const response = await api.get('/api/proyectos/asignacion/');
    return response.data;
  },

  // Obtener un proyecto específico
  getById: async (id) => {
    const response = await api.get(`/api/proyectos/asignacion/${id}/`);
    return response.data;
  },

  // Crear nuevo proyecto
  create: async (data) => {
    const response = await api.post('/api/proyectos/asignacion/', data);
    return response.data;
  },

  // Actualizar proyecto
  update: async (id, data) => {
    const response = await api.put(`/api/proyectos/asignacion/${id}/`, data);
    return response.data;
  },

  // Eliminar proyecto
  delete: async (id) => {
    const response = await api.delete(`/api/inspectores/asignacion/${id}/`);
    return response.data;
  },
};

export default asignacionService;