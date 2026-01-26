// services/inventarioService.js
import api from '../utils/api';

const inventarioService = {
  // Obtener todo el inventario
  getAll: async () => {
    const response = await api.get('/api/proyectos/inventario/');
    return response.data;
  },

  // Obtener inventario por proyecto
  getByProyecto: async (proyectoId) => {
    const response = await api.get(`/api/proyectos/inventario/?proyecto=${proyectoId}`);
    return response.data;
  },

  // Obtener un item específico
  getById: async (id) => {
    const response = await api.get(`/api/proyectos/inventario/${id}/`);
    return response.data;
  },

  // Crear nuevo item de inventario
  create: async (data) => {
    const response = await api.post('/api/proyectos/inventario/', data);
    return response.data;
  },

  // Actualizar item
  update: async (id, data) => {
    const response = await api.put(`/api/proyectos/inventario/${id}/`, data);
    return response.data;
  },

  // Eliminar item
  delete: async (id) => {
    const response = await api.delete(`/api/proyectos/inventario/${id}/`);
    return response.data;
  },
};

export default inventarioService;