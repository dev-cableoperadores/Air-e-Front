// services/kmzService.js
import { getToken } from '../services/authService';
import api from '../utils/api';

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
    console.log('=== fetchProyectos START ===');
    console.log('Token recibido:', token ? `${token.substring(0, 30)}...` : 'UNDEFINED');

    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido: ' + typeof token);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await api.get('/api/inspectores/kmz-imports/');

    console.log('Proyectos obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en fetchProyectos:', error);
    throw error;
  } finally {
    console.log('=== fetchProyectos END ===');
  }
};