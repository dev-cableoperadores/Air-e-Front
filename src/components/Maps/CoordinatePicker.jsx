// components/CoordinatePicker.jsx
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir el ícono de leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Componente para seleccionar coordenadas en el mapa haciendo click
 */
function CoordinatePicker({ 
  center = [10.3932, -75.4898], 
  zoom = 13, 
  selectedPosition = null, 
  onPositionChange 
}) {
  const [position, setPosition] = useState(selectedPosition);

  const handleLocationSelect = (newPosition) => {
    setPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const lat = parseFloat(formData.get('lat'));
    const lng = parseFloat(formData.get('lng'));

    if (!isNaN(lat) && !isNaN(lng)) {
      handleLocationSelect([lat, lng]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Formulario manual de coordenadas */}
      <form onSubmit={handleManualInput} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          name="lat"
          placeholder="Latitud"
          defaultValue={position ? position[0] : ''}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="lng"
          placeholder="Longitud"
          defaultValue={position ? position[1] : ''}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
        >
          Establecer
        </button>
      </form>

      {/* Instrucciones */}
      <p className="text-xs text-gray-600 dark:text-gray-400">
        💡 Haz clic en el mapa para seleccionar coordenadas o ingrésalas manualmente
      </p>

      {/* Mapa */}
      <div className="rounded-lg overflow-hidden shadow border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={position || center}
          zoom={zoom}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {/* Mostrar coordenadas seleccionadas */}
      {position && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>✓ Coordenadas seleccionadas:</strong>
            <br />
            Latitud: {position[0].toFixed(6)} | Longitud: {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

export default CoordinatePicker;