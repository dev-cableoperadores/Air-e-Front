// components/MapFeatures.jsx
import { Marker, Popup, Polyline, Polygon } from 'react-leaflet';

/**
 * Renderiza las features del KMZ en el mapa
 */
function MapFeatures({ features }) {
  return (
    <>
      {features.map((feature, index) => {
        // Validación de seguridad
        if (!feature.coordinates) return null;

        // Renderizar Point
        if (feature.type === 'Point') {
          const pos = [feature.coordinates.lat, feature.coordinates.lon];
          if (isNaN(pos[0]) || isNaN(pos[1])) return null;

          return (
            <Marker key={`point-${index}`} position={pos}>
              <Popup>
                <strong>{feature.proyecto}</strong><br /><br />
                <strong>N°{feature.name}</strong>
                <p>{feature.description}</p>
                <small>
                  Lat: {feature.coordinates.lat.toFixed(6)}<br />
                  Lon: {feature.coordinates.lon.toFixed(6)}
                </small>
              </Popup>
            </Marker>
          );
        }

        // Renderizar LineString
        if (feature.type === 'LineString') {
          const positions = feature.coordinates.map(c => [c.lat, c.lon]);
          return (
            <Polyline
              key={`line-${index}`}
              positions={positions}
              color="blue"
              weight={3}
            >
              <Popup>
                <strong>{feature.name}</strong>
                <p>{feature.description}</p>
                <small>Puntos: {feature.coordinates.length}</small>
              </Popup>
            </Polyline>
          );
        }

        // Renderizar Polygon
        if (feature.type === 'Polygon') {
          const positions = feature.coordinates.map(c => [c.lat, c.lon]);
          return (
            <Polygon
              key={`polygon-${index}`}
              positions={positions}
              color="red"
              fillColor="red"
              fillOpacity={0.3}
            >
              <Popup>
                <strong>{feature.name}</strong>
                <p>{feature.description}</p>
                <small>Vértices: {feature.coordinates.length}</small>
              </Popup>
            </Polygon>
          );
        }

        return null;
      })}
    </>
  );
}

export default MapFeatures;