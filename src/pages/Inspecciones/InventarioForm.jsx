// pages/inspecciones/InventarioForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import inventarioService from '../../services/inventarioService';
import inspectoresService from '../../services/inspectoresService';
import asignacionService from '../../services/asignacionService';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input'; // Importado
import Select from '../../components/UI/Select'; // Importado
import Textarea from '../../components/UI/Textarea'; // Importado
import { toast } from 'react-hot-toast';
import MapFeatures from '../../components/MapFeatures';
import MapChangeView from '../../components/MapChangeView';
import { convertDjangoToFeatures } from '../../utils/kmlParser';
import L from 'leaflet';
import PhotoUploader from '../../components/PhotoUploader';
import { ALTURAS, MATERIALES, CHOICE_TIPO_POSTE, ELEMENTOS_EXISTENTES } from '../../utils/constants'
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const selectedPosteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onLocationSelect, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) onLocationSelect([e.latlng.lat, e.latlng.lng]);
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
    rf1: '', rf2: '', rf3: ''
  });
  useEffect(() => { loadData(); }, [proyectoId]);

  useEffect(() => {
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
      const proyectoData = await asignacionService.getById(proyectoId);
      setProyecto(proyectoData);
      
      if (proyectoData?.kmzimport) {
        setProjectFeatures(convertDjangoToFeatures([proyectoData.kmzimport]));
      }
      
      const inspectoresData = await inspectoresService.getAll();
      setInspectores(Array.isArray(inspectoresData) ? inspectoresData : inspectoresData.results || []);

      const inventarioData = await inventarioService.getByProyecto(proyectoId);
      setInventarios(Array.isArray(inventarioData) ? inventarioData : inventarioData.results || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    toast.success(`Coordenadas seleccionadas: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
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
      
      // Si cantidad_prst es 0, no navegar a PRSTs
      const cantidadPrst = parseInt(formData.cantidad_prst) || 0;
      
      if (cantidadPrst === 0) {
        toast.info('No hay PRSTs para registrar en este poste');
        resetForm();
        loadData();
      } else {
        // Navegar a PRSTs en modo bucle
        navigate(`/inspecciones/prsts/${newInventario.id}?cantidad=${cantidadPrst}&proyecto=${proyectoId}&modo=bucle`);
      }
    } catch (error) {
      console.error('Error creating inventario:', error);
      toast.error('Error al crear inventario');
    }
  };

  const resetForm = () => {
    setFormData({
      proyecto_id: proyectoId, brigada_responsable_id: '', numero_poste_en_plano: '',
      coordenada: '', elementos_existentes: '', tipo_poste: '', material: '',
      altura: '', cantidad_prst: '', observaciones: '', rf1: '', rf2: '', rf3: ''
    });
    setSelectedPosition(null);
    setShowForm(false);
  };
  const handleMapClick = (position) => {
    if (!showForm) return;
    setSelectedPosition(position);
    
    // Notificación de coordenadas
    toast.success(`Coordenadas seleccionadas: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
    
    // Limpia el número si el punto NO viene de un poste existente
    setFormData(prev => ({
      ...prev,
      numero_poste_en_plano: '',
    }));
  };

  // 2. Define esta función para clics sobre postes del KMZ (MapFeatures)
  const handlePosteClick = (position, posteName) => {
    if (showForm) {
      setSelectedPosition(position);
      setFormData(prev => ({
        ...prev,
        numero_poste_en_plano: posteName || '',
      }));
      
      // Notificación de poste seleccionado
      toast.success(`Poste "${posteName}" seleccionado`);
    }
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
  if (loading) return <div className="flex justify-center min-h-screen"><Loading /></div>;

  return (
    <div className="w-full space-y-4 p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-black">Inventario General</h1>
          <p className="text-sm text-gray-500">Proyecto: <strong>{proyecto?.nombre}</strong></p>
        </div>
        <Button onClick={() => navigate('/inspecciones/asignacion')} variant="outline">← Volver</Button>
      </div>

      {/* Mapa */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        <div style={{ height: '400px' }} className="rounded-lg overflow-hidden border">
          <MapContainer center={[10.9878, -74.7889]} zoom={15} maxZoom={22} style={{ height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={22}      // Límite lógico
              maxNativeZoom={18} />
            <MapChangeView features={projectFeatures} />
            <MapFeatures 
              features={projectFeatures} 
              onPosteClick={handlePosteClick} 
              clickEnabled={showForm} 
            />
            <MapClickHandler 
              onLocationSelect={handleMapClick} 
              enabled={showForm} 
            />
            {selectedPosition && showForm && <Marker position={selectedPosition} icon={selectedPosteIcon} />}
          </MapContainer>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="mt-4">
          {showForm ? '✕ Cancelar' : '+ Nuevo Registro'}
        </Button>
      </div>

      {/* Formulario Refactorizado con Etiquetas Personalizadas */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Registrar Poste</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Select
              label="Brigada Responsable *"
              name="brigada_responsable_id"
              value={formData.brigada_responsable_id}
              onChange={handleChange}
              options={inspectores.map(i => ({ value: i.id, label: i.user.username || `Inspector #${i.id}` }))}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Número de Poste en Plano"
                name="numero_poste_en_plano"
                type="number"
                value={formData.numero_poste_en_plano}
                onChange={handleChange}
                required
              />
              <Input
                label="Coordenadas (Seleccionar en mapa)"
                name="coordenada"
                value={formData.coordenada}
                readOnly
                placeholder="Click en el mapa"
              />
              <Select
                label="Elementos Existentes"
                name="elementos_existentes"
                value={formData.elementos_existentes}
                onChange={handleChange}
                options={ELEMENTOS_EXISTENTES}
              />
              <Select
                label="Tipo de Poste"
                name="tipo_poste"
                value={formData.tipo_poste}
                onChange={handleChange}
                options={CHOICE_TIPO_POSTE}
                required
              />
              <Select
                label="Material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                options={MATERIALES}
                required
              />
              <Select
                label="Altura (m)"
                name="altura"
                value={formData.altura}
                onChange={handleChange}
                options={ALTURAS}
                required
              />
              <Input
                label="Cantidad de PRSTs"
                name="cantidad_prst"
                type="number"
                value={formData.cantidad_prst}
                onChange={handleChange}
                required
              />
            </div>

            <Textarea
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
            />

            <PhotoUploader
              proyectoNombre={proyecto?.nombre}
              inventarioId={proyectoId || 'nuevo'}
              tipo="inventario"
              onUploadSuccess={(urls) => {
                setFormData(prev => ({ ...prev, rf1: urls[0] || '', rf2: urls[1] || '', rf3: urls[2] || '' }));
              }}
            />

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">Guardar</Button>
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">Cancelar</Button>
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