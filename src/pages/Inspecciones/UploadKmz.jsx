// pages/inspecciones/List.jsx
import { MapContainer, TileLayer } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchKmzImportsNoInspeccionados } from '../../services/kmzService';
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
import { useTracking } from '../../hooks/useTracking';

function InspeccionesList() {
  const [kmzFeatures, setKmzFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
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
        //console.log('✅ Proyectos obtenidos correctamente');

        const features = convertDjangoToFeatures(proyectos);
        setKmzFeatures(features);
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

  const handleUploadSuccess = (newFeatures) => {
    setKmzFeatures(prevFeatures => [...prevFeatures, ...newFeatures]);
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
    <div className="proyectos-container text-center px-4 py-6 text-gray-800">
      {user && user.is_inspector && !user.is_staff ? (
        <h1>Inspecciones</h1>
      ) : (
        <h1>Proyectos KMZ para Inspección</h1>
      )}
      <Link to="/inspecciones/asignacion"><Button>Ver Inspecciones</Button></Link>
      {user && user.is_staff && (
      <KMZUpload onUploadSuccess={handleUploadSuccess} />
      )}



      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <FeatureStats features={kmzFeatures} />

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