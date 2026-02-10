// components/MonitorRealtime.jsx
import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { supabase } from '../../lib/supabase';
import L from 'leaflet';

// Icono personalizado para diferenciar inspectores
const inspectorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

export default function MonitorRealtime() {
  const [inspectores, setInspectores] = useState([]);

  useEffect(() => {
    // 1. Cargar solo los que están en línea inicialmente
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('tracking_inspectores')
        .select('*')
        .eq('en_linea', true);
      setInspectores(data || []);
    };
    fetchInitial();

    // 2. Suscribirse a cambios
    // Dentro del useEffect de MonitorRealtime.jsx
const channel = supabase
  .channel('mapa_monitoreo', {
    config: {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    },
  })
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tracking_inspectores' }, 
    (payload) => {
      //console.log("Cambio detectado:", payload);
      // ... tu lógica de setInspectores
    }
  )
  .subscribe((status) => {
    // Esto te dirá exactamente qué está pasando
    //console.log("Estado de la conexión Realtime:", status);
    if (status === 'CLOSED') console.error("Error: El servidor cerró la conexión");
    if (status === 'CHANNEL_ERROR') console.error("Error: No se pudo conectar al canal");
  });

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <>
      {inspectores.map(ins => (
        <Marker 
          key={ins.inspector_id} 
          position={[ins.lat, ins.lng]} 
          icon={inspectorIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold border-b mb-1">{ins.nombre_inspector}</p>
              <p>📍 Lat: {ins.lat.toFixed(5)}</p>
              <p>📍 Lng: {ins.lng.toFixed(5)}</p>
              <p className="text-gray-500 text-xs mt-1">
                Act: {new Date(ins.ultima_actualizacion).toLocaleTimeString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}