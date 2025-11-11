import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Loader2, Shield, Users, BarChart3, Sparkles, Building2 } from 'lucide-react'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { login, isAuthenticated, loading, checkAuth } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast.error('Por favor ingresa usuario y contraseña')
      return
    }
    
    setIsLoggingIn(true)
    
    try {
      const result = await login(username, password)
      
      if (result.success) {
        toast.success('¡Bienvenido a AIR-E!', {
          position: "bottom-right",
          duration: 3000,
        })
        navigate('/')
      } else {
        toast.error(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-accent">
      <div className="flex min-h-screen">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
            {/* Logo */}
            <div className="mb-12">
              <div className="mb-6">
                <div className="w-64 bg-white rounded-lg flex items-center justify-center shadow-lg p-3">
                  <img
                    src="/aire.png"
                    alt="AIR-E Logo"
                    className="w-full h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling.style.display = 'block'
                    }}
                  />
                  <Building2 className="w-10 h-10 text-primary hidden" />
                </div>
              </div>
              <h2 className="text-5xl font-bold mb-4 leading-tight">
                Portal de Gestión
                <br />
                <span className="text-accent">Infraestructura y Censo</span>
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Plataforma integral para la gestión de cable-operadores y contratos de AIR-E
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Gestión Completa</h3>
                  <p className="text-white/80 text-sm">visualizacion de cada cable-operador</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">creacion de Contratos</h3>
                  <p className="text-white/80 text-sm">contratos de forma eficiente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Creacion de cableoperadores</h3>
                  <p className="text-white/80 text-sm">Administra cable-operadores y contratos de forma eficiente</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Seguridad Empresarial</h3>
                  <p className="text-white/80 text-sm">Protección de datos y auditoría completa</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-white/70 text-sm">Seguro</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-white/70 text-sm">Disponible</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-white/70 text-sm">Confiable</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-56 bg-white rounded-lg flex items-center justify-center shadow-lg p-2">
                  <img
                    src="/logo-aire.png"
                    alt="AIR-E Logo"
                    className="w-full h-14 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling.style.display = 'block'
                    }}
                  />
                  <Building2 className="w-8 h-8 text-primary hidden" />
                </div>
              </div>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de vuelta
              </h2>
              <p className="text-gray-600">
                Accede a tu portal de gestión
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Access Info */}
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-primary text-sm mb-1">
                      Acceso Restringido
                    </h3>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      Este portal está destinado exclusivamente para personal autorizado de AIR-E. 
                      Utiliza tus credenciales corporativas para acceder.
                    </p>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Usuario"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Ingresa tu usuario"
                  className=""
                />

                <Input
                  label="Contraseña"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                  className=""
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Al iniciar sesión, aceptas nuestras políticas de seguridad y uso interno.
                  <br />
                  Todas las actividades son monitoreadas y auditadas.
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Problemas para acceder?{' '}
                <a href="mailto:soporte@aire.com" className="text-primary hover:text-primary-hover font-medium">
                  Contacta soporte técnico
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
