import api from '../utils/api'

const dashboardService = {
  getStats: async () => {
    try { const response = await api.get('/api/dashboard/');
      const cableoperadoresCount = response.data.total_cableoperadores ?? 0
      const contratosVigentes = response.data.contratos_activos ?? 0
      const contratosVencidos = response.data.contratos_vencidos ?? 0
      const contratosCount = response.data.total_contratos ?? 0
      const facturasVigentes = response.data.facturas_pendientes ?? 0
      const facturasCount = response.data.total_facturas ?? 0
      return {
        totalCableoperadores: cableoperadoresCount,
        contratosVigentes,
        contratosVencidos,
        totalContratos: contratosCount,
        facturasVigentes,
        totalFacturas: facturasCount,
      }
    } catch (error) {
      console.error('Error en DashboardService.getStats:', error)
      throw error
    }
  },
}
export default dashboardService