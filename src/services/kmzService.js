// services/kmzService.js
import { getToken } from '../services/authService';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
/**
 * Envía datos KMZ a Django
 */
export const uploadKMZData = async (geoData, token) => {
    const response = await api.post('/api/inspectores/kmz-imports/', geoData);
    return response.data;
  };
/**
 * Obtiene proyectos guardados desde Django
 */
export const fetchProyectos = async (token) => {
  try {
    //console.log('=== fetchProyectos START ===');
    //console.log('Token recibido:', token ? `${token.substring(0, 30)}...` : 'UNDEFINED');

    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido: ' + typeof token);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await api.get('/api/inspectores/kmz-imports/');

    //console.log('Proyectos obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en fetchProyectos:', error);
    throw error;
  } finally {
    //console.log('=== fetchProyectos END ===');
  }
};

// Listado de kmz importados que aun no han sido asociados a inspecciones
export const fetchKmzImports = async (token) => {
  try {
    //console.log('=== fetchKmzImports START ===');
    //console.log('Token recibido:', token ? `${token.substring(0, 30)}...` : 'UNDEFINED');

    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido: ' + typeof token);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await api.get('/api/inspectores/kmz-imports-novinculados/');

    //console.log('Proyectos obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en fetchKmzImports:', error);
    throw error;
  } finally {
    //console.log('=== fetchKmzImports END ===');
  }
};

// elimina un KMZ importado
export const deleteKmzImport = async (id) => {
  try {
    const response = await api.delete(`/api/inspectores/kmz-imports/${id}/`);
    toast.success('Archivo KMZ eliminado');
    return response.data;
  } catch (error) {
    console.error('Error eliminando KMZ:', error);
    throw error;
  }
};
export const fetchKmzImportsNoInspeccionados = async (token) => {
  try {
    //console.log('=== fetchKmzImports START ===');
    //console.log('Token recibido:', token ? `${token.substring(0, 30)}...` : 'UNDEFINED');

    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido: ' + typeof token);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await api.get('/api/inspectores/kmz-imports-noinspeccionados/');

    //console.log('Proyectos obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en fetchKmzImports:', error);
    throw error;
  } finally {
    //console.log('=== fetchKmzImports END ===');
  }
};
export const handleMarcarInspeccionado = async (id) => {
  const hoy = new Date().toISOString().split('T')[0];

  try {
    const response = await api.patch(`/api/proyectos/asignacion/${id}/`, {
      inspeccionado: true,
      fecha_inspeccion: hoy,
    });

    toast.success('Proyecto marcado como inspeccionado');
    return response.data; 
  } catch (error) {
    throw error;
  }
};

// toggle inspeccionado boolean (true/false)
export const toggleInspeccionado = async (id, value) => {
  try {
    const payload = { inspeccionado: value };
    if (value) {
      payload.fecha_inspeccion = new Date().toISOString().split('T')[0];
    }
    const response = await api.patch(`/api/proyectos/asignacion/${id}/`, payload);
    toast.success(`Proyecto ${value ? 'marcado' : 'desmarcado'} como inspeccionado`);
    return response.data;
  } catch (error) {
    console.error('Error toggle inspeccionado:', error);
    throw error;
  }
};