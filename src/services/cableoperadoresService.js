import api from '../utils/api' 

// 🚨 CLAVE DEL CACHÉ y TIEMPO DE EXPIRACIÓN (5 minutos)
const CABLEOPERADORES_CACHE_KEY = 'cableoperadores_list_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos en milisegundos

const cableoperadoresService = {
  // Devuelve la respuesta completa (útil para leer count, next, previous)
  getAllFull: async (params = {}) => {
    const response = await api.get('/api/cableoperadores/list/', { params })
    return response.data
  },

  // Devuelve solo el array de results (compatibilidad con llamadas existentes)
  getAll: async (params = {}) => {
    const data = await cableoperadoresService.getAllFull(params)
    return data?.results || []
  },

  // Trae todos los items iterando páginas (use con cuidado - puede ser lento)
  getAllAllPages: async (params = {}) => {
    const cachedData = localStorage.getItem(CABLEOPERADORES_CACHE_KEY);
    const now = Date.now();

    if (cachedData) {
        try {
            const { timestamp, data } = JSON.parse(cachedData);
            // Verificar si el caché no ha expirado
            if (now - timestamp < CACHE_EXPIRY_MS) {
                console.log('CABLEOPERADORES: Retornando datos desde caché de localStorage.');
                // 🚨 El dato cacheado ya tiene la estructura { results: [], count: N }
                return data; 
            } else {
                console.log('CABLEOPERADORES: Caché de localStorage expirado.');
                localStorage.removeItem(CABLEOPERADORES_CACHE_KEY);
            }
        } catch (e) {
            console.error('Error al parsear datos cacheados:', e);
            localStorage.removeItem(CABLEOPERADORES_CACHE_KEY);
        }
    }
    
    // --- Lógica de carga real (si el caché falla o expira) ---
    const accumulated = []
    let url = '/api/cableoperadores/list/'
    let query = { ...params }
    let firstData = null;

    // First request
    let response = await api.get(url, { params: query })
    firstData = response.data
    accumulated.push(...(firstData.results || []))
    let next = firstData.next

    // Iterate following pages
    while (next) {
      // next es una URL completa, api.get debe manejarla directamente
      response = await api.get(next)
      const pageData = response.data
      accumulated.push(...(pageData.results || []))
      next = pageData.next
    }
    
    const finalData = { results: accumulated, count: firstData?.count || accumulated.length };

    // Guardar la nueva respuesta en caché con el timestamp actual
    const cacheItem = {
        timestamp: now,
        data: finalData,
    };
    localStorage.setItem(CABLEOPERADORES_CACHE_KEY, JSON.stringify(cacheItem));

    return finalData;
  },

  getById: async (id) => {
    const response = await api.get(`/api/cableoperadores/detail/${id}/`)
    return response.data
  },

  create: async (data) => {
    try {
        const response = await api.post('/api/cableoperadores/list/', data)
        return response.data
    } catch (error) {
        // 🚨 Verificar si el error contiene la data de validación de DRF (e.g., 400)
        if (error.response?.status === 400 && error.response?.data) {
            console.error("Error de Validación del Servidor (400):", error.response.data);
            // Generar un mensaje de error más legible
            const validationErrors = Object.entries(error.response.data)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
            throw new Error(`Error de validación: ${validationErrors}`);
        }
        throw error; // Re-lanzar otros errores (401, 500, etc.)
    }
  },

  update: async (id, data) => {
    const response = await api.put(`/api/cableoperadores/detail/${id}/`, data)
    // 💡 Puedes agregar aquí cache.delete_pattern() si usas cache de BE
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/api/cableoperadores/detail/${id}/`)
    // 💡 Puedes agregar aquí cache.delete_pattern() si usas cache de BE
    return response.data
  },
  // trae todas las notificaciones de un cableoperador
  getNotificaciones: async (id) => {
    const response = await api.get(`/api/cableoperadores/${id}/notificaciones/`)
    return response.data
  },
  // 🚨 Usando el nombre postNotificaciones (plural)
  postNotificaciones: async (id, data) => { 
    const response = await api.post(`/api/cableoperadores/${id}/notificaciones/`, data)
    
    return response.data
  },
}

export default cableoperadoresService