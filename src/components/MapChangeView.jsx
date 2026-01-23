// components/MapChangeView.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Componente que ajusta automáticamente la vista del mapa
 * cuando se cargan nuevas features
 */
function MapChangeView({ features }) {
  const map = useMap();

  useEffect(() => {
    if (features.length > 0) {
      const first = features[0];
      console.log("Centrando mapa en la primera feature:", first);
      const coords = Array.isArray(first.coordinates)
        ? [first.coordinates[0].lat, first.coordinates[0].lon]
        : [first.coordinates.lat, first.coordinates.lon];
      
      map.flyTo(coords, 14);
    }
  }, [features, map]);

  return null;
}

export default MapChangeView;