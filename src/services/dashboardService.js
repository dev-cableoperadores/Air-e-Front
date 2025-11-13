import cableoperadoresService from './cableoperadoresService'
import contratosService from './contratosService'
import facturasService from './facturasService'

const dashboardService = {
  getStats: async () => {
    try {
      // Pedimos la respuesta completa para poder leer el `count`
      const [cableoperadoresResponse, contratosResponse, facturasResponse] = await Promise.all([
        cableoperadoresService.getAllFull(),
        contratosService.getAllFull(),
        facturasService.getAllFull(),
      ])

      const cableoperadoresCount = cableoperadoresResponse?.count ?? (Array.isArray(cableoperadoresResponse) ? cableoperadoresResponse.length : 0)
      const contratosCount = contratosResponse?.count ?? (Array.isArray(contratosResponse) ? contratosResponse.length : 0)
      const facturasCount = facturasResponse?.count ?? (Array.isArray(facturasResponse) ? facturasResponse.length : 0)
      // Para calcular vigentes/vencidos necesitamos los items: si la respuesta contiene results, usamos esa lista,
      // en caso contrario asumimos que la respuesta ya es el array
      const contratosItems = Array.isArray(contratosResponse) ? contratosResponse : (contratosResponse.results || [])
      const facturasItems = Array.isArray(facturasResponse) ? facturasResponse : (facturasResponse.results || [])

      const contratosVigentes = contratosItems.filter((c) => c.estado_contrato === 'Vigente').length
      const contratosVencidos = contratosItems.filter((c) => c.estado_contrato === 'Vencido').length
      const facturasVigentes = facturasItems.filter((f) => f.estado === 'Pendiente').length

      return {
        cableoperadores: {
          count: cableoperadoresCount,
        },
        totalCableoperadores: cableoperadoresCount,
        contratosVigentes,
        contratosVencidos,
        totalContratos: contratosCount,
        facturasVigentes,
        totalFacturas: facturasCount,
      }
    } catch (error) {
      console.error('Error en dashboardService.getStats:', error)
      throw error
    }
  },
}

export default dashboardService

