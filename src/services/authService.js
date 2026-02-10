import api from '../utils/api'

// Modo de desarrollo - cambiar a false cuando el backend esté disponible
const USE_MOCK = false

const authService = {
  login: async (username, password) => {
    if (USE_MOCK) {
      // Simulación de login para desarrollo
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username && password) {
            resolve({
              access: `mock-token-${Date.now()}`,
              refresh: `mock-refresh-${Date.now()}`
            })
          } else {
            reject({ response: { data: { detail: 'Credenciales inválidas' } } })
          }
        }, 500)
      })
    }
    
    const response = await api.post('/api/token/', {
      username,
      password,
    })
    //console.log('Login response:', response)
    return response.data
  },

  refreshToken: async (refreshToken) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            access: `mock-token-${Date.now()}`
          })
        }, 300)
      })
    }
    
    const response = await api.post('/api/token/refresh/', {
      refresh: refreshToken,
    })
    return response.data
  },

  verifyToken: async (token) => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ valid: true })
        }, 200)
      })
    }
    
    const response = await api.post('/api/token/verify/', {
      token,
    })
    return response.data
  },

  getProfile: async () => {
    if (USE_MOCK) {
      // Datos de usuario mock para desarrollo
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 1,
            username: 'admin',
            email: 'admin@aire.com',
            first_name: 'Administrador',
            last_name: 'AIR-E'
          })
        }, 300)
      })
    }
    
    const response = await api.get('/api/auth/user/')
    return response.data
  },
}

// Función helper para obtener el token de acceso
export const getToken = () => {
  return localStorage.getItem('access_token')
}

// Función helper para obtener el refresh token
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token')
}

// Función helper para guardar tokens
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken)
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  }
}

// Función helper para limpiar tokens
export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Función helper para verificar si hay sesión activa
export const isAuthenticated = () => {
  return !!getToken()
}

export default authService
