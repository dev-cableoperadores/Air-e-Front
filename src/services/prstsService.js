// services/prstsService.js
import api from '../utils/api';

const prstsService = {
  // Obtener todos los PRSTs
  getAll: async () => {
    const response = await api.get('/api/inspectores/prsts-inspeccionados/');
    return response.data;
  },

  // Obtener PRSTs por inventario
  getByInventario: async (inventarioId) => {
    const response = await api.get(`/api/inspectores/prsts-inspeccionados/?inventario=${inventarioId}`);
    return response.data;
  },

  // Obtener un PRST específico
  getById: async (id) => {
    const response = await api.get(`/api/proyectos/prsts-inspeccionados/${id}/`);
    return response.data;
  },

  // Crear nuevo PRST
  create: async (data) => {
    const response = await api.post('/api/proyectos/prsts-inspeccionados/', data);
    return response.data;
  },

  // Actualizar PRST
  update: async (id, data) => {
    const response = await api.put(`/api/proyectos/prsts-inspeccionados/${id}/`, data);
    return response.data;
  },

  // Eliminar PRST
  delete: async (id) => {
    const response = await api.delete(`/api/proyectos/prsts-inspeccionados/${id}/`);
    return response.data;
  },
};

export default prstsService;