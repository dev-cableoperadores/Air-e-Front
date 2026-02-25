// pages/inspecciones/List.jsx
import { MapContainer, TileLayer } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchKmzImportsNoInspeccionados, fetchKmzImports, handleMarcarInspeccionado, toggleInspeccionado, deleteKmzImport } from '../../services/kmzService';
import asignacionService from '../../services/asignacionService';
import inspectoresService from '../../services/inspectoresService';
import { ExportarExcelInventario, ExportarExcelInventarioHoy } from '../../services/exportExcel';
import { toast } from 'react-hot-toast';
import { getToken } from '../../services/authService'; // Ajustado a tu ruta real
import { convertDjangoToFeatures } from '../../utils/kmlParser';
import MapChangeView from '../../components/Maps/MapChangeView';
import MapFeatures from '../../components/Maps/MapFeatures';
import KMZUpload from '../../components/Maps/KMZUpload';
import FeatureStats from '../../components/Maps/FeatureStats';
import MonitorRealtime from '../../components/Maps/MonitorRealtime';
import LocationMarker from '../../components/Maps/LocationMarker';
import LocateControl from '../../components/Maps/LocateControl';
import './UploadKmz.css';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/UI/Button'
import Modal from '../../components/UI/Modal'
import { useTracking } from '../../hooks/useTracking';

function InspeccionesList() {
  const navigate = useNavigate();
  const [kmzFeatures, setKmzFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const  [ CountProyectos, setCountProyectos] = useState(0);
  const [kmzImports, setKmzImports] = useState([]);
  const [inspectores, setInspectores] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', kmzimport_id: '', brigadas_asignadas_ids: [] });
  // modal para asignar directamente desde lista de KMZ
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKmz, setModalKmz] = useState(null);
  const [modalProjectName, setModalProjectName] = useState('');
  const [modalBrigadas, setModalBrigadas] = useState([]);
  useTracking(user); 
  useEffect(() => {
    const loadData = async () => {
      try {
        //console.log('\n========== Proyectos useEffect START ==========');
        const token = getToken();
        //console.log('getToken() retornó:', token ? `${token.substring(0, 30)}...` : 'null/undefined');

        if (!token) {
          //console.warn('❌ No hay token disponible');
          throw new Error('No hay token de autenticación');
        }

        //console.log('✅ Token encontrado, llamando fetchProyectos...');
        const proyectos = await fetchKmzImportsNoInspeccionados(token);
        const kmzData = await fetchKmzImports(token);
        //console.log('✅ Proyectos obtenidos correctamente');

        const features = convertDjangoToFeatures(proyectos);
        setKmzFeatures(features);
        setCountProyectos(proyectos.count);
        setKmzImports(Array.isArray(kmzData) ? kmzData : kmzData.results || []);
        
        // Cargar proyectos asignados
        const proyectosData = await asignacionService.getAll();
        setProyectos(Array.isArray(proyectosData) ? proyectosData : proyectosData.results || []);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Error al cargar datos iniciales: ' + error.message);
      } finally {
        setLoading(false);
        //console.log('========== Proyectos useEffect END ==========\n');
      }
    };

    loadData();
  }, []);

  // cargar inspectores para formulario
  useEffect(() => {
    const loadInspectores = async () => {
      try {
        const data = await inspectoresService.getAll();
        const items = Array.isArray(data?.results) ? data.results : (data || []);
        setInspectores(items);
      } catch (err) {
        console.error('No se pudieron cargar inspectores', err);
      }
    };

    loadInspectores();
  }, []);

  const handleUploadSuccess = async (newFeatures) => {
    setKmzFeatures(prevFeatures => [...prevFeatures, ...newFeatures]);
    
    // Recargar la lista de KMZ importados después de una carga exitosa
    try {
      const token = getToken();
      if (token) {
        const kmzData = await fetchKmzImports(token);
        setKmzImports(Array.isArray(kmzData) ? kmzData : kmzData.results || []);
      }
    } catch (error) {
      console.error('Error al recargar KMZ importados:', error);
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

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await asignacionService.create(formData);
      toast.success('Proyecto asignado exitosamente');
      setFormData({ nombre: '', kmzimport_id: '', brigadas_asignadas_ids: [] });

      // Recargar proyectos después de crear uno nuevo
      const proyectosData = await asignacionService.getAll();
      setProyectos(Array.isArray(proyectosData) ? proyectosData : proyectosData.results || []);

      // refrescar toda la página para asegurarnos de que todo se recarga
      window.location.reload();
    } catch (error) {
      console.error('Error al asignar proyecto:', error);
      toast.error('Error al asignar proyecto');
    }
  };

  // eliminar KMZ importado
  const handleKmzDelete = async (id) => {
    if (!window.confirm('¿Eliminar este archivo KMZ?')) return;
    try {
      await deleteKmzImport(id);
      // si estaba seleccionado, limpiar
      if (formData.kmzimport_id === String(id)) {
        setFormData(prev => ({ ...prev, kmzimport_id: '' }));
      }
      const token = getToken();
      if (token) {
        const kmzData = await fetchKmzImports(token);
        setKmzImports(Array.isArray(kmzData) ? kmzData : kmzData.results || []);
      }
    } catch (error) {
      console.error('Error al eliminar KMZ:', error);
      toast.error('No se pudo eliminar el archivo');
    }
  };

  // handlers para modal
  const openModalForKmz = (kmz) => {
    setModalKmz(kmz);
    setModalProjectName('');
    setModalBrigadas([]);
    setModalOpen(true);
  };

  const toggleModalBrigada = (id) => {
    setModalBrigadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleModalAssign = async () => {
    if (!modalKmz) return;
    try {
      await asignacionService.create({
        nombre: modalProjectName,
        kmzimport_id: modalKmz.id,
        brigadas_asignadas_ids: modalBrigadas,
      });
      toast.success('Proyecto asignado exitosamente');
      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Error modal asignar:', err);
      toast.error('No se pudo asignar proyecto');
    }
  };

  const onToggleInspeccion = async (proyecto) => {
    try {
      await toggleInspeccionado(proyecto.id, !proyecto.inspeccionado);
      // Recargar proyectos
      const proyectosData = await asignacionService.getAll();
      setProyectos(Array.isArray(proyectosData) ? proyectosData : proyectosData.results || []);
    } catch (error) {
      // handled by service
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este proyecto?')) return;
    try {
      await asignacionService.delete(id);
      toast.success('Proyecto eliminado');
      // Recargar proyectos después de eliminar
      const proyectosData = await asignacionService.getAll();
      setProyectos(Array.isArray(proyectosData) ? proyectosData : proyectosData.results || []);
    } catch (error) {
      console.error('Error deleting proyecto:', error);
      toast.error('Error al eliminar proyecto');
    }
  };

  if (loading) {
    return (
      <div className="proyectos-container">
        <div className="loading-message">
          <p>Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="proyectos-container text-center px-4 py-6 text-gray-800 w-full max-w-full overflow-x-hidden">
      {/* header card */}
      <div className="w-full space-y-4 p-4">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 shadow rounded-lg">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {user && user.is_inspector && !user.is_staff ? 'Proyectos' : 'Proyectos KMZ para Inspección'}
            </h1>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {CountProyectos} proyectos
            </p>
          </div>
          
          {/* Modificamos este contenedor para que sea flex-col y alinee sus elementos a la derecha (en desktop) o centro (en móvil) */}
          <div className="flex flex-col items-center md:items-end gap-3">
            
            {/* Contenedor para los botones en fila */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <Link to="/inspecciones/asignacion">
                <Button>Ver Proyectos</Button>
              </Link>
              {user && user.is_staff && (
                <Link to="/monitoreo">
                  <Button variant='danger'>Monitoreo</Button>
                </Link>
              )}
            </div>

            {/* KMZUpload aparecerá debajo de los botones */}
            {user && user.is_staff && (
              <div className="w-full flex justify-center md:justify-end mt-1">
                <KMZUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            )}
            
          </div>
        </div>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {/* tabla de proyectos asignados - VISTA ESCRITORIO */}
          <div className="mt-6 hidden md:block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto p-4 ">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Proyectos</h2>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proyecto
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      KMZ Asociado
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
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

                    {user.is_staff && kmzImports.map((kmz) => (
                      <tr key={kmz.id} >
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{kmz.filename || `KMZ #${kmz.id}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white dark:text-gray-400">
                          <span className="px-2 py-1 bg-red-700  rounded text-xs font-bold">
                            Por Asignar
                          </span>
                          </td>
                        <td className="px-6 py-4 text-sm">
                          <Button size="xs" variant="outline" onClick={() => openModalForKmz(kmz)}>
                            Asignar
                          </Button>
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))
                  }
                  {proyectos.map((proyecto) => (
                    <tr key={proyecto.id}>
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-left font-medium text-gray-900 dark:text-gray-100">
                        {proyecto.nombre}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                        {proyecto.kmzimport?.filename || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {proyecto.inspeccionado ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                            ✅ Listo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
                            ⏳ Pendiente
                          </span>
                        )}
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
                          <Button
                            size="sm"
                            variant={proyecto.inspeccionado ? "success" : "outline"}
                            className={proyecto.inspeccionado 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : "text-blue-600 border-blue-600 hover:bg-blue-50"}
                            onClick={() => onToggleInspeccion(proyecto)}
                          >
                            {proyecto.inspeccionado ? '🔓 Habilitar' : '🚩 Finalizar'}
                          </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/inspecciones/inventario/${proyecto.id}`)}
                          >
                          🔍 Ir a Inspección
                        </Button>
                        {user.is_staff && (
                          <Button
                          size="sm"
                          variant="outline"
                          onClick={() => ExportarExcelInventario(proyecto.id, proyecto.kmzimport?.filename || 'Inventario')}
                          >
                          📥 Exportar
                        </Button>
                         )}
                        
                        {user.is_staff && (
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
            {proyectos.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                No hay proyectos asignados.
              </div>
            )}
          </div>

          {/* VISTA MÓVIL: TARJETAS - CARDS */}
          <div className="mt-6 md:hidden grid grid-cols-1 gap-4">
            {proyectos.map((proyecto) => (
              <div key={proyecto.id} className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg space-y-3">
                {/* Cabecera de la Tarjeta */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {proyecto.kmzimport?.filename}
                    </h3>
                    {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                      📂 KMZ: {proyecto.kmzimport?.filename || 'N/A'}
                    </p> */}
                  </div>
                  {proyecto.inspeccionado && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold whitespace-nowrap ml-2">
                      ✅ Listo
                    </span>
                  )}
                </div>

                {/* Lista de Brigadas */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Brigadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {proyecto.brigadas_asignadas?.length > 0 ? (
                      proyecto.brigadas_asignadas.map((brigada) => (
                        <span
                          key={brigada.id}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                        >
                          {brigada.user.username}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin asignar</span>
                    )}
                  </div>
                </div>

                <hr className="dark:border-gray-700" />

                {/* Botones de Acción Móvil */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {/* Botón Ir a Inspección y Ver Inventario */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-xs"
                    onClick={() => navigate(`/inspecciones/inventario/${proyecto.id}`)}
                  >
                    🔍 Inspección
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-xs"
                    onClick={() => ExportarExcelInventario(proyecto.id, proyecto.kmzimport?.filename || 'Inventario')}
                  >
                    📥 Exportar
                  </Button>

                  {user.is_staff && (
                    <>
                      <Button
                        size="sm"
                        variant={proyecto.inspeccionado ? "success" : "outline"}
                        className={`w-full justify-center text-xs ${proyecto.inspeccionado 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "text-blue-600 border-blue-600"}`}
                        onClick={() => !proyecto.inspeccionado && onFinalizarInspeccion(proyecto.id)}
                        disabled={proyecto.inspeccionado}
                      >
                        {proyecto.inspeccionado ? '✅ Listo' : '🔎 Finalizar'}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(proyecto.id)}
                        className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 text-xs"
                      >
                        🗑️ Eliminar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {proyectos.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                No hay proyectos asignados.
              </div>
            )}
          </div>

          {/* modal para asignar desde lista de kmz */}
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Asignar proyecto">
            <div className="space-y-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brigadas a asignar
                </p>
                <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded">
                  {inspectores.map((inspector) => (
                    <label key={inspector.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalBrigadas.includes(inspector.id)}
                        onChange={() => toggleModalBrigada(inspector.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {`${inspector.user.first_name} ${inspector.user.last_name}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="success" onClick={handleModalAssign} disabled={modalBrigadas.length===0}>
                  Asignar proyecto
                </Button>
              </div>
            </div>
          </Modal>

          <FeatureStats features={kmzFeatures} />
        </div>
      </div>

      <div className="map-section">
        <h2>Visualización de Proyectos en el Mapa</h2>
        <MapContainer
          preferCanvas={true}
          center={[10.9878, -74.7889]}
          zoom={13}
          maxZoom={22}
          style={{ height: '600px', width: '100%' }}
        >
          <LocateControl />
          <LocationMarker />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}      // Límite lógico
            maxNativeZoom={18}
            
          />
          
          {user?.is_staff && <MonitorRealtime />}
          <MapChangeView features={kmzFeatures} />
          <MapFeatures features={kmzFeatures} />
        </MapContainer>
      </div>
    </div>
  );
}

export default InspeccionesList;