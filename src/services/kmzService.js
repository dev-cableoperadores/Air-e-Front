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
    // La URL debe coincidir exactamente con tu path de Django
    // Si en Django es 'asignacion/<int:pk>/', aquí es:
    const response = await api.patch(`/api/proyectos/asignacion/${id}/`, {
      inspeccionado: true,
      fecha_inspeccion: hoy,
    });

    toast.success('Proyecto marcado como inspeccionado');
    return response.data; 
  } catch (error) {
    // El interceptor ya muestra un toast.error general, 
    // pero puedes capturar errores específicos aquí si lo deseas.
    throw error;
  }
};