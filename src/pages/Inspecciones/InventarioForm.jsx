// pages/inspecciones/InventarioForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import inventarioService from '../../services/inventarioService';
import inspectoresService from '../../services/inspectoresService';
import asignacionService from '../../services/asignacionService';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import { toast } from 'react-hot-toast';
import MapFeatures from '../../components/MapFeatures';
import MapChangeView from '../../components/MapChangeView';
import { convertDjangoToFeatures } from '../../utils/kmlParser';
import L from 'leaflet';
import PhotoUploader from '../../components/PhotoUploader';
// Corregir el ícono de leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Crear un ícono personalizado para el nuevo poste seleccionado
const selectedPosteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para capturar clics en el mapa
function MapClickHandler({ onLocationSelect, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) {
        onLocationSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

function InventarioForm() {
  const { proyectoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proyecto, setProyecto] = useState(null);
  const [inspectores, setInspectores] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [projectFeatures, setProjectFeatures] = useState([]);

  const [formData, setFormData] = useState({
    proyecto_id: proyectoId,
    brigada_responsable_id: '',
    numero_poste_en_plano: '',
    coordenada: '',
    elementos_existentes: '',
    tipo_poste: '',
    material: '',
    altura: '',
    cantidad_prst: '',
    observaciones: '',
    rf1: '',
    rf2: '',
    rf3: ''
  });

  const CHOICE_TIPO_POSTE = ['BT', 'MT', 'MT-BT', 'Torre STR', 'Sin identificar'];
  const ELEMENTOS_EXISTENTES = [
    'Cortacircuitos/Seccionador',
    'Transformador de distribucion',
    'Interruptor de Potencia',
    'Reconectador'
  ];
  const MATERIALES = ['Concreto', 'Madera', 'Metalico', 'Fibra'];
  const ALTURAS = [8, 9, 10, 11, 12, 14, 16, 18, 25];

  useEffect(() => {
    loadData();
  }, [proyectoId]);

  useEffect(() => {
    // Actualizar coordenadas cuando se selecciona una posición en el mapa
    if (selectedPosition) {
      setFormData(prev => ({
        ...prev,
        coordenada: `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}`
      }));
    }
  }, [selectedPosition]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar proyecto
      const proyectoData = await asignacionService.getById(proyectoId);
      setProyecto(proyectoData);
      console.log('Proyecto data:', proyectoData);
      
      if (proyectoData && proyectoData.kmzimport) {
        const features = convertDjangoToFeatures([proyectoData.kmzimport]);
        setProjectFeatures(features);
      }
      
      // Cargar inspectores
      const inspectoresData = await inspectoresService.getAll();
      setInspectores(Array.isArray(inspectoresData) ? inspectoresData : inspectoresData.results || []);

      // Cargar inventarios del proyecto
      const inventarioData = await inventarioService.getByProyecto(proyectoId);
      setInventarios(Array.isArray(inventarioData) ? inventarioData : inventarioData.results || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };


  const handleMapClick = (position) => {
    if (!showForm) return;

    setSelectedPosition(position);

    // Limpia el número si el punto NO viene de un poste existente
    setFormData(prev => ({
      ...prev,
      numero_poste_en_plano: '',
    }));

    toast.success(`Coordenadas seleccionadas: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
  };


  // Nueva función para manejar el clic en un poste existente

  const handlePosteClick = (position, posteName) => {
    if (showForm) {
      setSelectedPosition(position);
      setFormData(prev => ({
      ...prev,
      numero_poste_en_plano: posteName || '',
    }));
      toast.success(`Poste "${posteName}" seleccionado`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.coordenada) {
      toast.error('Debe seleccionar coordenadas en el mapa');
      return;
    }

    try {
      const newInventario = await inventarioService.create(formData);
      toast.success('Inventario creado exitosamente');
      
      // Preguntar si desea agregar PRSTs
      if (window.confirm('¿Desea agregar PRSTs para este poste?')) {
        navigate(`/inspecciones/prsts/${newInventario.id}`);
      } else {
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Error creating inventario:', error);
      toast.error('Error al crear inventario');
    }
  };

  const resetForm = () => {
    setFormData({
      proyecto_id: proyectoId,
      brigada_responsable_id: '',
      numero_poste_en_plano: '',
      coordenada: '',
      elementos_existentes: '',
      tipo_poste: '',
      material: '',
      altura: '',
      cantidad_prst: '',
      observaciones: '',
      rf1: '',
      rf2: '',
      rf3: ''
    });
    setSelectedPosition(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este inventario?')) return;
    
    try {
      await inventarioService.delete(id);
      toast.success('Inventario eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting inventario:', error);
      toast.error('Error al eliminar inventario');
    }
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Inventario General
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Proyecto: <strong>{proyecto?.nombre}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Total registros: {inventarios.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/inspecciones/asignacion')} variant="outline">
              ← Volver
            </Button>
            
          </div>
        </div>
      </div>

      {/* Mapa unificado - Siempre visible */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Mapa del Proyecto
          </h2>
          
        </div>
        
        <div style={{ height: '500px', width: '100%' }} className="rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <MapContainer
            center={[10.9878, -74.7889]}
            zoom={15}
            maxZoom={22}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={22}      // Límite lógico
              maxNativeZoom={18}
            />
            
            {/* Centra el mapa en los postes del proyecto */}
            <MapChangeView features={projectFeatures} />
            
            {/* Dibuja los postes y líneas del KMZ con click handler */}
            <MapFeatures 
              features={projectFeatures}
              onPosteClick={handlePosteClick}
              clickEnabled={showForm}
            />

            {/* Captura clics en cualquier punto del mapa */}
            <MapClickHandler 
              onLocationSelect={handleMapClick} 
              enabled={showForm}
            />

            {/* Marca la nueva posición seleccionada con marcador verde */}
            {selectedPosition && showForm && (
              <Marker position={selectedPosition} icon={selectedPosteIcon}>
                <div className="p-2">
                  <strong>✓ Ubicación Seleccionada</strong><br />
                  <small>
                    Lat: {selectedPosition[0].toFixed(6)}<br />
                    Lon: {selectedPosition[1].toFixed(6)}
                  </small>
                </div>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        {showForm && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                🎯 <strong>Modo de selección activo:</strong>
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 ml-4 list-disc">
                <li>Haz clic en un <strong>poste existente</strong> (marcador azul) para usar su ubicación</li>
                <li>O haz clic en <strong>cualquier punto del mapa</strong> para establecer una nueva ubicación</li>
              </ul>
            </div>
          )}
          {!showForm && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              📍 Visualiza los postes existentes del proyecto
            </p>
          )}
          <br />
        <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancelar' : '+ Nuevo Registro'}
        </Button>
        </div>
        {/* Mostrar coordenadas seleccionadas */}
        {selectedPosition && showForm && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-300">
              <strong>✓ Coordenadas seleccionadas:</strong>
              <br />
              Latitud: {selectedPosition[0].toFixed(6)} | Longitud: {selectedPosition[1].toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Registrar Poste Inspeccionado
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Brigada responsable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brigada Responsable *
              </label>
              <select
                required
                value={formData.brigada_responsable_id}
                onChange={(e) => setFormData({ ...formData, brigada_responsable_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una brigada</option>
                {inspectores.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.user.username || `Inspector #${inspector.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de poste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Poste en Plano *
                </label>
                <input
                  type="number"
                  required
                  value={formData.numero_poste_en_plano}
                  onChange={(e) => setFormData({ ...formData, numero_poste_en_plano: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Coordenadas (solo lectura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coordenadas del Poste *
                </label>
                <input
                  type="text"
                  required
                  readOnly
                  value={formData.coordenada}
                  placeholder="Haz clic en el mapa arriba"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-800"
                />
              </div>

              {/* Elementos existentes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Elementos Existentes
                </label>
                <select
                  value={formData.elementos_existentes}
                  onChange={(e) => setFormData({ ...formData, elementos_existentes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione</option>
                  {ELEMENTOS_EXISTENTES.map((elem) => (
                    <option key={elem} value={elem}>{elem}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de poste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Poste *
                </label>
                <select
                  required
                  value={formData.tipo_poste}
                  onChange={(e) => setFormData({ ...formData, tipo_poste: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione</option>
                  {CHOICE_TIPO_POSTE.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material *
                </label>
                <select
                  required
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione</option>
                  {MATERIALES.map((mat) => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* Altura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Altura (m) *
                </label>
                <select
                  required
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione</option>
                  {ALTURAS.map((alt) => (
                    <option key={alt} value={alt}>{alt}</option>
                  ))}
                </select>
              </div>

              {/* Cantidad PRST */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad de PRSTs *
                </label>
                <input
                  type="number"
                  required
                  value={formData.cantidad_prst}
                  onChange={(e) => setFormData({ ...formData, cantidad_prst: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

             {/* Subida de fotos */}
            <PhotoUploader
              proyectoNombre={proyecto?.nombre}
              inventarioId={proyectoId || 'nuevo'}
              tipo="inventario"
              maxPhotos={3}
              label="Fotos del Poste"
              onUploadSuccess={(urls) => {
                setFormData(prev => ({
                  ...prev,
                  rf1: urls[0] || '',
                  rf2: urls[1] || '',
                  rf3: urls[2] || ''
                }));
              }}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Guardar Inventario
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de inventarios */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  N° Poste
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Coordenada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  PRSTs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {console.log('Inventarios:', inventarios)}
              {inventarios.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(inv.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {inv.numero_poste_en_plano}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {inv.coordenada}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {inv.tipo_poste}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {inv.cantidad_prst}
                  </td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/inspecciones/prsts/${inv.id}`)}
                    >
                      📋 PRSTs
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(inv.id)}
                      className="text-red-600"
                    >
                      🗑️
                    </Button>
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

export default InventarioForm;