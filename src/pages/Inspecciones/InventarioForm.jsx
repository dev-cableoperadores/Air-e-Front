// pages/inspecciones/InventarioForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import inventarioService from '../../services/inventarioService';
import inspectoresService from '../../services/inspectoresService';
import asignacionService from '../../services/asignacionService';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Textarea from '../../components/UI/Textarea';
import MapFeatures from '../../components/Maps/MapFeatures';
import MapChangeView from '../../components/Maps/MapChangeView';
import MonitorRealtime from '../../components/Maps/MonitorRealtime';
import PhotoUploader from '../../components/PhotoUploader';
import LocationMarker from '../../components/Maps/LocationMarker';
import LocateControl from '../../components/Maps/LocateControl';
import { convertDjangoToFeatures } from '../../utils/kmlParser';
import { ALTURAS, MATERIALES, CHOICE_TIPO_POSTE, ELEMENTOS_EXISTENTES } from '../../utils/constants';
import { useTracking } from '../../hooks/useTracking';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';

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
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
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
  useTracking(user);
  
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.coordenada) {
      toast.error('Debe seleccionar coordenadas en el mapa');
      return;
    }

    if (!formData.rf1 || !formData.rf2 || !formData.rf3) {
      toast.error('Debes cargar las 3 fotos correctamente');
      return;
    }

    try {
      if (editingId) {
        await inventarioService.update(editingId, formData);
        toast.success('Inventario actualizado exitosamente');
        resetForm();
        loadData();
      } else {
        const newInventario = await inventarioService.create(formData);
        toast.success('Inventario creado exitosamente');
        
        const cantidadPrst = parseInt(formData.cantidad_prst) || 0;
        
        if (cantidadPrst === 0) {
          toast('No hay PRSTs para registrar en este poste');
          resetForm();
          loadData();
        } else {
          navigate(`/inspecciones/prsts/${newInventario.id}?cantidad=${cantidadPrst}&proyecto=${proyectoId}&modo=bucle`);
        }
      }
    } catch (error) {
      console.error('Error saving inventario:', error);
      toast.error(editingId ? 'Error al actualizar inventario' : 'Error al crear inventario');
    }
  };

  const handleEdit = (item) => {
    let latLng = null;
    if (item.coordenada) {
      const parts = item.coordenada.split(',').map(n => parseFloat(n.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        latLng = parts;
      }
    }

    setEditingId(item.id);

    setFormData({
      proyecto_id: proyectoId,
      brigada_responsable_id: typeof item.brigada_responsable === 'object' 
        ? item.brigada_responsable.id 
        : item.brigada_responsable,
      numero_poste_en_plano: item.numero_poste_en_plano,
      coordenada: item.coordenada,
      elementos_existentes: item.elementos_existentes,
      tipo_poste: item.tipo_poste,
      material: item.material,
      altura: item.altura,
      cantidad_prst: item.cantidad_prst,
      observaciones: item.observaciones || '',
      rf1: item.rf1 || '',
      rf2: item.rf2 || '',
      rf3: item.rf3 || ''
    });

    setSelectedPosition(latLng);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.loading(`Editando poste ${item.numero_poste_en_plano}...`, { duration: 1000 });
  };

  const resetForm = () => {
    setFormData({
      proyecto_id: proyectoId, brigada_responsable_id: '', numero_poste_en_plano: '',
      coordenada: '', elementos_existentes: '', tipo_poste: '', material: '',
      altura: '', cantidad_prst: '', observaciones: '', rf1: '', rf2: '', rf3: ''
    });
    setSelectedPosition(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleMapClick = (position) => {
    if (!showForm) return;
    setSelectedPosition(position);
    toast.success(`Coordenadas seleccionadas: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`);
    setFormData(prev => ({
      ...prev,
      numero_poste_en_plano: '',
    }));
  };

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
      {/* Header Responsivo */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-black">Inventario General</h1>
          <p className="text-sm text-gray-500">Proyecto: <strong>{proyecto?.nombre}</strong></p>
        </div>
        <Button onClick={() => navigate('/inspecciones/asignacion')} variant="outline" className="w-full md:w-auto">
          ← Volver
        </Button>
      </div>

      {/* Mapa */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        <div style={{ height: '400px' }} className="rounded-lg overflow-hidden border">
          <MapContainer center={[10.9878, -74.7889]} zoom={15} maxZoom={22} style={{ height: '100%' }} preferCanvas={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={22} maxNativeZoom={18} />
            <MapChangeView features={projectFeatures} />
            <LocationMarker />
            <LocateControl />
            {user?.is_staff && <MonitorRealtime />}
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
        <Button onClick={() => setShowForm(!showForm)} className="mt-4 w-full md:w-auto">
          {showForm ? '✕ Cancelar' : '+ Nuevo Registro'}
        </Button>
      </div>

      {/* Formulario */}
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
              initialPhotos={[formData.rf1, formData.rf2, formData.rf3].filter(Boolean)}
              onUploadSuccess={(urls) => {
                setFormData(prev => ({ ...prev, rf1: urls[0] || '', rf2: urls[1] || '', rf3: urls[2] || '' }));
              }}
              required
            />

            <div className="flex flex-col md:flex-row gap-4">
              <Button type="submit" className="flex-1 w-full">Guardar</Button>
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1 w-full">Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA DE ESCRITORIO: TABLA (Oculta en md e inferior) */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(inv)}
                      className="text-blue-600"
                    >
                      ✏️ Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA MÓVIL: CARDS (Visible en md e inferior) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {inventarios.map((inv) => (
          <div key={inv.id} className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg flex flex-col gap-3 border-l-4 border-blue-500">
            {/* Encabezado Card */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Poste #{inv.numero_poste_en_plano}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(inv.fecha).toLocaleDateString()}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                 {inv.cantidad_prst} PRSTs
              </span>
            </div>

            {/* Detalles */}
            <div className="text-sm text-gray-700 dark:text-gray-300 grid grid-cols-2 gap-2">
               <div>
                 <span className="font-semibold text-xs text-gray-500 uppercase block">Tipo</span>
                 {inv.tipo_poste}
               </div>
               <div>
                 <span className="font-semibold text-xs text-gray-500 uppercase block">Altura</span>
                 {inv.altura}m
               </div>
               <div className="col-span-2">
                 <span className="font-semibold text-xs text-gray-500 uppercase block">Coordenadas</span>
                 <span className="font-mono text-xs">{inv.coordenada}</span>
               </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Botones de Acción Móvil */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full justify-center text-blue-600 border-blue-200"
                onClick={() => handleEdit(inv)}
              >
                ✏️ Editar
              </Button>
              <Button
                className="w-full justify-center"
                onClick={() => navigate(`/inspecciones/prsts/${inv.id}`)}
              >
                📋 PRSTs
              </Button>
              <Button
                variant="outline"
                className="w-full col-span-2 justify-center text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleDelete(inv.id)}
              >
                🗑️ Eliminar
              </Button>
            </div>
          </div>
        ))}
        {inventarios.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-white dark:bg-gray-800 rounded-lg">
            No hay inventarios registrados aún.
          </div>
        )}
      </div>

    </div>
  );
}

export default InventarioForm;