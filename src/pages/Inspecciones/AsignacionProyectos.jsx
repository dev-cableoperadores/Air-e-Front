// pages/inspecciones/AsignacionProyectos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import asignacionService from '../../services/asignacionService';
import { fetchKmzImports } from '../../services/kmzService';
import inspectoresService from '../../services/inspectoresService';
import { getToken } from '../../services/authService';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext'
import { handleMarcarInspeccionado } from '../../services/kmzService';

function AsignacionProyectos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proyectos, setProyectos] = useState([]);
  const [kmzImports, setKmzImports] = useState([]);
  const [inspectores, setInspectores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    kmzimport_id: '',
    brigadas_asignadas_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);
  // Agrega esta función arriba de tu return
const onFinalizarInspeccion = async (id) => {
  try {
    await handleMarcarInspeccionado(id);
    // IMPORTANTE: Refrescar los datos locales para que el botón cambie a ✅
    loadData(); 
  } catch (error) {
    // El error ya lo maneja el service con toast, pero aquí detenemos la ejecución
  }
};
  const loadData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Cargar proyectos existentes
      const proyectosData = await asignacionService.getAll();
      setProyectos(Array.isArray(proyectosData) ? proyectosData : proyectosData.results || []);

      // Cargar KMZ imports disponibles
      const kmzData = await fetchKmzImports(token);
      setKmzImports(Array.isArray(kmzData) ? kmzData : kmzData.results || []);

      // Cargar inspectores/brigadas
      const inspectoresData = await inspectoresService.getAll();
      setInspectores(Array.isArray(inspectoresData) ? inspectoresData : inspectoresData.results || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await asignacionService.create(formData);
      toast.success('Proyecto asignado exitosamente');
      setFormData({ nombre: '', kmzimport_id: '', brigadas_asignadas_ids: [] });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating proyecto:', error);
      toast.error('Error al crear proyecto');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;
    
    try {
      await asignacionService.delete(id);
      toast.success('Proyecto eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting proyecto:', error);
      toast.error('Error al eliminar proyecto');
    }
  };

  const handleBrigadaToggle = (brigadaId) => {
    setFormData(prev => {
      const brigadas = prev.brigadas_asignadas_ids.includes(brigadaId)
        ? prev.brigadas_asignadas_ids.filter(id => id !== brigadaId)
        : [...prev.brigadas_asignadas_ids, brigadaId];
      
      return { ...prev, brigadas_asignadas_ids: brigadas };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4">
      {user.is_staff == true && (
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Asignación de Proyectos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: {proyectos.length} proyectos
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancelar' : '+ Nuevo Proyecto'}
          </Button>
        </div>
      </div>
      )}

      {/* Formulario de creación */}
      {showForm && user.is_staff == true && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Crear Nuevo Proyecto
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre del proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Proyecto Zona Norte"
              />
            </div>

            {/* Seleccionar KMZ Import */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Archivo KMZ Asociado *
              </label>
              <select
                required
                value={formData.kmzimport_id}
                onChange={(e) => setFormData({ ...formData, kmzimport_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un archivo KMZ</option>
                {kmzImports.map((kmz) => (
                  <option key={kmz.id} value={kmz.id}>
                    {kmz.filename || `KMZ #${kmz.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleccionar Brigadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brigadas Asignadas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                {inspectores.map((inspector) => (
                  <label
                    key={inspector.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.brigadas_asignadas_ids.includes(inspector.id)}
                      onChange={() => handleBrigadaToggle(inspector.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {inspector.user.username || `Inspector #${inspector.id}`}
                    </span>
                  </label>
                    
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Crear Proyecto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de proyectos */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  KMZ Asociado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Brigadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {proyectos.map((proyecto) => (
                <tr key={proyecto.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {proyecto.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {proyecto.kmzimport?.filename || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-1">
                      {proyecto.brigadas_asignadas?.map((brigada) => (
                        <span
                          key={brigada.id}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {brigada.user.username || `#${brigada.id}`}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user.is_staff == true && (
                    <Button
                      size="sm"
                      variant={proyecto.inspeccionado ? "success" : "outline"}
                      className={proyecto.inspeccionado 
                        ? "bg-green-100 text-green-700 border-green-200 cursor-default" 
                        : "text-blue-600 border-blue-600 hover:bg-blue-50"}
                      onClick={() => !proyecto.inspeccionado && onFinalizarInspeccion(proyecto.id)}
                      disabled={proyecto.inspeccionado}
                    >
                      {proyecto.inspeccionado ? '✅ Inspeccionado' : '🔎 Finalizar'}
                    </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/inspecciones/inventario/${proyecto.id}`)}
                    >
                      📝 Inventario
                    </Button>
                    {user.is_staff == true && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(proyecto.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AsignacionProyectos;