// components/MapFeatures.jsx
import { Marker, Popup, Polyline, Polygon, Tooltip } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
/**
 * Renderiza las features del KMZ en el mapa con soporte para clicks
 */
function MapFeatures({ features, onPosteClick, clickEnabled = false }) {
const [currentZoom, setCurrentZoom] = useState(13);

  // 2. Configuramos los eventos del mapa
  const map = useMapEvents({
    zoomend: () => {
      const newZoom = map.getZoom();
      console.log("Zoom actual:", newZoom); // Para que verifiques en consola
      setCurrentZoom(newZoom);
    },
  });
  return (
    <>
      {features.map((feature, index) => {
        // Validación de seguridad
        if (!feature.coordinates) return null;

        // Renderizar Point (Postes)
        if (feature.type === 'Point') {
          const pos = [feature.coordinates.lat, feature.coordinates.lon];
          if (isNaN(pos[0]) || isNaN(pos[1])) return null;

          return (
            <Marker 
              key={`point-${index}`} 
              position={pos}
              eventHandlers={{
                click: () => {
                  if (clickEnabled && onPosteClick) {
                    onPosteClick(pos, feature.name || `Poste ${index + 1}`);
                  }
                }
              }}
            >
              {currentZoom > 15 &&(
              <Tooltip 
              permanent
              direction="top" 
              offset={[-15,-10]} 
              opacity={0.6}
            >
              {feature.name || `Poste ${index + 1}`}
            </Tooltip>)}
              <Popup>
                <div>
                  <strong>{feature.proyecto || 'Proyecto'}</strong><br />
                  <strong>N° {feature.name || index + 1}</strong><br />
                  {feature.description && <p>{feature.description}</p>}
                  <small>
                    Lat: {feature.coordinates.lat.toFixed(6)}<br />
                    Lon: {feature.coordinates.lon.toFixed(6)}
                  </small>
                  {clickEnabled && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <small className="text-blue-600 font-medium">
                        ✓ Clic para seleccionar este poste
                      </small>
                    </div>
                  )}
                </div>
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
                <strong>{feature.name || 'Línea'}</strong>
                {feature.description && <p>{feature.description}</p>}
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
                <strong>{feature.name || 'Polígono'}</strong>
                {feature.description && <p>{feature.description}</p>}
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