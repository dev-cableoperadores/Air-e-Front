import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cable, FileText, CheckCircle, AlertTriangle, Activity, TrendingUp, Plus } from 'lucide-react'
import dashboardService from '../services/dashboardService'
import { toast } from 'react-hot-toast'
import Loading from '../components/UI/Loading'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCableoperadores: 0,
    contratosVigentes: 0,
    contratosVencidos: 0,
    totalContratos: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getStats()
      //console.log('Dashboard stats data:', data)
      setStats(data)
    } catch (error) {
      //console.error('Error al cargar estadísticas:', error)
      toast.error('Error al cargar estadísticas. Verifica que el backend esté corriendo.')
      // Establecer valores por defecto si hay error
      setStats({
        totalCableoperadores: 0,
        contratosVigentes: 0,
        contratosVencidos: 0,
        totalContratos: 0,
      })
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return <Loading fullScreen />
  }

  const statsCards = [
    {
      title: 'Total Cableoperadores',
      value: stats?.totalCableoperadores || stats?.cableoperadores?.count || 0,
      icon: Cable,
      color: 'bg-blue-500',
      link: '/cableoperadores'
    },
    {
      title: 'Contratos Activos',
      value: stats?.contratosVigentes || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/contratos'
    },
    {
      title: 'Contratos Vencidos',
      value: stats?.contratosVencidos || 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      link: '/contratos'
    },
    {
      title: 'Total Contratos',
      value: stats?.totalContratos || 0,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/contratos'
    }
  ]

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden px-3 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-col sm:flex-row sm:items-start min-w-0">
        <div className="w-full sm:w-auto min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
            Bienvenido al sistema de gestión de AIR-E
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between min-w-0 gap-2 sm:gap-4">
                <div className="flex-1 min-w-0 pr-1 sm:pr-2 md:pr-4 lg:pr-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate min-h-[20px]">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-x-2 pr-1 flex-wrap sm:flex-nowrap align-baseline max-w-full">
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap tabular-nums leading-none">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className={`p-3 md:p-4 rounded-lg ${stat.color} flex-shrink-0 ml-0 sm:ml-3 mt-2 sm:mt-0 self-end sm:self-auto`}>
                  <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Quick Actions */}
        <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Acciones Rápidas
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <Link to="/cableoperadores/nuevo">
              <button className="w-full p-3 md:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group text-left">
                <div className="flex items-center">
                  <Cable className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 block">
                      Nuevo Cableoperador
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Registrar nuevo cableoperador
                    </span>
                  </div>
                </div>
              </button>
            </Link>

            <Link to="/contratos/nuevo">
              <button className="w-full p-3 md:p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group text-left">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 text-gray-400 group-hover:text-green-500 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 block">
                      Nuevo Contrato
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Crear nuevo contrato
                    </span>
                  </div>
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 p-3 md:p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bienvenido
            </h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Sistema de gestión de cableoperadores y contratos de AIR-E
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Sistema operativo</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span>Datos actualizados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

