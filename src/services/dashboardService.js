import cableoperadoresService from './cableoperadoresService'
import contratosService from './contratosService'

const dashboardService = {
  getStats: async () => {
    try {
      // Pedimos la respuesta completa para poder leer el `count`
      const [cableoperadoresResponse, contratosResponse] = await Promise.all([
        cableoperadoresService.getAllFull(),
        contratosService.getAllFull(),
      ])

      const cableoperadoresCount = cableoperadoresResponse?.count ?? (Array.isArray(cableoperadoresResponse) ? cableoperadoresResponse.length : 0)
      const contratosCount = contratosResponse?.count ?? (Array.isArray(contratosResponse) ? contratosResponse.length : 0)

      // Para calcular vigentes/vencidos necesitamos los items: si la respuesta contiene results, usamos esa lista,
      // en caso contrario asumimos que la respuesta ya es el array
      const contratosItems = Array.isArray(contratosResponse) ? contratosResponse : (contratosResponse.results || [])

      const contratosVigentes = contratosItems.filter((c) => c.estado_contrato === 'Vigente').length
      const contratosVencidos = contratosItems.filter((c) => c.estado_contrato === 'Vencido').length

      return {
        cableoperadores: {
          count: cableoperadoresCount,
        },
        totalCableoperadores: cableoperadoresCount,
        contratosVigentes,
        contratosVencidos,
        totalContratos: contratosCount,
      }
    } catch (error) {
      console.error('Error en dashboardService.getStats:', error)
      throw error
    }
  },
}

export default dashboardService

