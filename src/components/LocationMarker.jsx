import { useState, useCallback } from 'react';
import { Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export default function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(0);

  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7114/7114631.png', // Icono de punto azul
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      setAccuracy(e.accuracy);
      map.flyTo(e.latlng, 17); // Zoom cercano para inspección
    },
    locationerror() {
      alert("No se pudo obtener la ubicación. Activa el GPS.");
    },
  });

  // Este componente no renderiza un botón (el botón lo pondremos arriba para que sea fijo)
  // Pero Leaflet necesita este componente dentro para escuchar el evento 'map.locate()'
  return position === null ? null : (
    <>
      <Circle center={position} radius={accuracy} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }} />
      <Marker position={position} icon={userIcon}>
        <Popup>Tu ubicación actual</Popup>
      </Marker>
    </>
  );
}

