// pages/inspecciones/PrstsForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import prstsService from '../../services/prstsService';
import inventarioService from '../../services/inventarioService';
import cableoperadoresService from '../../services/cableoperadoresService';
import SearchableSelect from '../../components/UI/SearchableSelect';
import Loading from '../../components/UI/Loading';
import Button from '../../components/UI/Button';
import { toast } from 'react-hot-toast';
import PhotoUploader from '../../components/PhotoUploader';
function PrstsForm() {
  const { inventarioId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventario, setInventario] = useState(null);
  const [cableoperadores, setCableoperadores] = useState([]);
  const [prsts, setPrsts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    inventario_id: inventarioId,
    cableoperador_id: '',
    cable: 0,
    caja_empalme: 0,
    reserva: 0,
    nap: 0,
    stp: 0,
    bajante: 0,
    amplificador: 0,
    fuentes: 0,
    receptor_optico: 0,
    antena: 0,
    gabinete: 0,
    otro: 0,
    rf1: '',
    rf2: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, [inventarioId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar inventario
      const inventarioData = await inventarioService.getById(inventarioId);
      setInventario(inventarioData);

      // Cargar cableoperadores
      const cableOpsData = await cableoperadoresService.getAllAllPages();
      setCableoperadores(Array.isArray(cableOpsData) ? cableOpsData : cableOpsData.results || []);

      // Cargar PRSTs del inventario
      const prstsData = await prstsService.getByInventario(inventarioId);
      setPrsts(Array.isArray(prstsData) ? prstsData : prstsData.results || []);
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
      await prstsService.create(formData);
      toast.success('PRST registrado exitosamente');
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating PRST:', error);
      toast.error('Error al registrar PRST');
    }
  };

  const resetForm = () => {
    setFormData({
      inventario_id: inventarioId,
      cableoperador_id: '',
      cable: 0,
      caja_empalme: 0,
      reserva: 0,
      nap: 0,
      stp: 0,
      bajante: 0,
      amplificador: 0,
      fuentes: 0,
      receptor_optico: 0,
      antena: 0,
      gabinete: 0,
      otro: 0,
      rf1: '',
      rf2: '',
      observaciones: ''
    });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este PRST?')) return;

    try {
      await prstsService.delete(id);
      toast.success('PRST eliminado');
      loadData();
    } catch (error) {
      console.error('Error deleting PRST:', error);
      toast.error('Error al eliminar PRST');
    }
  };

  const handleNumberChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setFormData({ ...formData, [field]: numValue });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }
  const cableOptions = cableoperadores.map(cable => ({
    label: cable.nombre_largo || cable.nombre || `Cableoperador #${cable.id}`,
    value: cable.id
  }));

  // Helper para manejar el cambio del SearchableSelect
  const handleSelectChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, cableoperador_id: value });
  };

  if (loading) return <Loading />;
  return (
    <div className="w-full space-y-4 p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              PRSTs Inspeccionados
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Poste N°: <strong>{inventario?.numero_poste_en_plano}</strong> | 
              Proyecto: <strong>{inventario?.proyecto?.nombre}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Total PRSTs registrados: {prsts.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate(`/inspecciones/inventario/${inventario?.proyecto?.id || inventario?.proyecto_id}`)} 
              variant="outline"
            >
              ← Volver
            </Button>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancelar' : '+ Nuevo PRST'}
            </Button>
          </div>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Registrar PRST
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cable operador */}
            <div>
              <SearchableSelect
                label="Cable Operador"
                name="cableoperador_id"
                value={formData.cableoperador_id}
                onChange={handleSelectChange}
                options={cableOptions}
                required={true}
                placeholder="Buscar cableoperador..."
              />
            </div>

            {/* Contadores de elementos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { field: 'cable', label: 'Cable' },
                { field: 'caja_empalme', label: 'Caja Empalme' },
                { field: 'reserva', label: 'Reserva' },
                { field: 'nap', label: 'NAP' },
                { field: 'stp', label: 'STP' },
                { field: 'bajante', label: 'Bajante' },
                { field: 'amplificador', label: 'Amplificador' },
                { field: 'fuentes', label: 'Fuentes' },
                { field: 'receptor_optico', label: 'Receptor Óptico' },
                { field: 'antena', label: 'Antena' },
                { field: 'gabinete', label: 'Gabinete' },
                { field: 'otro', label: 'Otro' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData[field]}
                    onChange={(e) => handleNumberChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Subida de fotos */}
            <PhotoUploader
              proyectoNombre={inventario?.proyecto?.nombre}
              inventarioId={inventarioId}
              tipo="prst"
              maxPhotos={2}
              label="Fotos del PRST"
              onUploadSuccess={(urls) => {
                setFormData(prev => ({
                  ...prev,
                  rf1: urls[0] || '',
                  rf2: urls[1] || ''
                }));
              }}
            />

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

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Guardar PRST
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

      {/* Lista de PRSTs */}
      <div className="grid grid-cols-1 gap-4">
        {prsts.map((prst) => (
          <div
            key={prst.id}
            className="bg-white dark:bg-gray-800 p-4 shadow rounded-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {prst.cableoperador?.nombre_largo || prst.cableoperador?.nombre || 'Cable Operador'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Inventario ID: {prst.inventario?.id}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(prst.id)}
                className="text-red-600"
              >
                🗑️ Eliminar
              </Button>
            </div>

            {/* Elementos en grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: 'Cable', value: prst.cable },
                { label: 'Caja Empalme', value: prst.caja_empalme },
                { label: 'Reserva', value: prst.reserva },
                { label: 'NAP', value: prst.nap },
                { label: 'STP', value: prst.stp },
                { label: 'Bajante', value: prst.bajante },
                { label: 'Amplificador', value: prst.amplificador },
                { label: 'Fuentes', value: prst.fuentes },
                { label: 'Receptor Óptico', value: prst.receptor_optico },
                { label: 'Antena', value: prst.antena },
                { label: 'Gabinete', value: prst.gabinete },
                { label: 'Otro', value: prst.otro },
              ].map(({ label, value }) => (
                value > 0 && (
                  <div
                    key={label}
                    className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{value}</p>
                  </div>
                )
              ))}
            </div>

            {prst.observaciones && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Observaciones:</strong> {prst.observaciones}
                </p>
              </div>
            )}

            {(prst.rf1 || prst.rf2) && (
              <div className="mt-3 flex gap-2">
                {prst.rf1 && (
                  <a
                    href={prst.rf1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    📷 Foto 1
                  </a>
                )}
                {prst.rf2 && (
                  <a
                    href={prst.rf2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    📷 Foto 2
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {prsts.length === 0 && !showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 text-center rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No hay PRSTs registrados para este poste.
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            + Agregar primer PRST
          </Button>
        </div>
      )}
    </div>
  );
}

export default PrstsForm;