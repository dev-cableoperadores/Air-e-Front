import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CableOperadoresList from './pages/CableOperadores/List'
import CableOperadoresNew from './pages/CableOperadores/New'
import CableOperadoresEdit from './pages/CableOperadores/Edit'
import CableOperadoresDetail from './pages/CableOperadores/Detail'
import ContratosList from './pages/Contratos/List'
import ContratosNew from './pages/Contratos/New'
import ContratosEdit from './pages/Contratos/Edit'
import ContratosDetail from './pages/Contratos/Detail'
import FacturasList from './pages/Facturas/List'
import FacturasNew from './pages/Facturas/New'
import FacturasEdit from './pages/Facturas/Edit'
import FacturasDetail from './pages/Facturas/Detail'
import MainLayout from './components/Layout/MainLayout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cableoperadores"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CableOperadoresList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cableoperadores/nuevo"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CableOperadoresNew />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cableoperadores/:id/editar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CableOperadoresEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cableoperadores/:id/detalle"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CableOperadoresDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contratos"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ContratosList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contratos/nuevo"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ContratosNew />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contratos/:id/editar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ContratosEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contratos/:id/detalle"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ContratosDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturas"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FacturasList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturas/nueva"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FacturasNew />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturas/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FacturasDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facturas/:id/editar"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <FacturasEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App

