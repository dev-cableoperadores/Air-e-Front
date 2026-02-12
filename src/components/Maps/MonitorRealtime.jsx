import React, { useEffect, useState, useMemo, memo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../lib/supabase';

// ------------------------------------------------------------------
// 1. CONFIGURACIÓN ESTÁTICA (Fuera del componente para no recargar)
// ------------------------------------------------------------------
const inspectorIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// ------------------------------------------------------------------
// 2. COMPONENTE MEMORIZADO (La clave para eliminar el lag)
// ------------------------------------------------------------------
// React.memo hace que este marcador SOLO se redibuje si lat/lng cambian.
// Si otro inspector se mueve, este marcador NO hace nada (ahorra CPU).
const InspectorMarker = memo(({ data }) => {
  return (
    <Marker position={[data.lat, data.lng]} icon={inspectorIcon}>
      <Popup>
        <div className="text-sm min-w-[150px]">
          <p className="font-bold border-b pb-1 mb-1 text-gray-800">
            {data.nombre_inspector}
          </p>
          <div className="space-y-1 text-gray-600">
            <p>📍 Lat: {data.lat.toFixed(5)}</p>
            <p>📍 Lng: {data.lng.toFixed(5)}</p>
            <p className="text-xs text-gray-400 flex justify-between mt-2 pt-2 border-t">
              <span>Última señal:</span>
              <span>{new Date(data.ultima_actualizacion).toLocaleTimeString()}</span>
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}, (prev, next) => {
  // Función de comparación personalizada:
  // Devuelve TRUE (no renderizar) si los datos importantes son iguales
  return (
    prev.data.lat === next.data.lat &&
    prev.data.lng === next.data.lng &&
    prev.data.ultima_actualizacion === next.data.ultima_actualizacion
  );
});

// ------------------------------------------------------------------
// 3. HOOK DE LÓGICA (Separa los datos de la vista)
// ------------------------------------------------------------------
function useInspectoresRealtime() {
  // Usamos un OBJETO {} en lugar de Array [] para acceso instantáneo por ID
  const [inspectores, setInspectores] = useState({});
  const [status, setStatus] = useState('Conectando...');

  useEffect(() => {
    // A. Carga Inicial
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('tracking_inspectores')
        .select('*')
        .eq('en_linea', true);

      if (data) {
        const mapaInicial = {};
        data.forEach(ins => { mapaInicial[ins.inspector_id] = ins; });
        setInspectores(mapaInicial);
        setStatus(`🟢 En línea (${data.length})`);
      }
    };

    fetchInitial();

    // B. Suscripción Realtime
    const channel = supabase
      .channel('sala_monitoreo_global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracking_inspectores' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          setInspectores((prev) => {
            const copia = { ...prev };

            // CASO 1: Inspector se desconecta o es eliminado
            if (eventType === 'DELETE' || (newRecord && newRecord.en_linea === false)) {
              const idToDelete = oldRecord?.inspector_id || newRecord?.inspector_id;
              delete copia[idToDelete];
              return copia;
            }

            // CASO 2: Nuevo inspector o movimiento
            if (newRecord && newRecord.en_linea === true) {
              copia[newRecord.inspector_id] = newRecord;
            }

            return copia;
          });
        }
      )
      .subscribe((estado) => {
        if (estado === 'SUBSCRIBED') setStatus('🟢 Conectado');
        if (estado === 'CLOSED') setStatus('🔴 Desconectado');
        if (estado === 'CHANNEL_ERROR') setStatus('⚠️ Error de Canal (Revisa SQL)');
      });

    return () => supabase.removeChannel(channel);
  }, []);

  // Convertimos el objeto a array para poder mapearlo en el render
  const listaInspectores = useMemo(() => Object.values(inspectores), [inspectores]);

  return { inspectores: listaInspectores, status };
}

// ------------------------------------------------------------------
// 4. COMPONENTE PRINCIPAL (Limpio y ligero)
// ------------------------------------------------------------------
export default function MonitorRealtime() {
  const { inspectores, status } = useInspectoresRealtime();

  return (
    <>
      {/* Panel de Estado Flotante */}
      <div className="leaflet-top leaflet-right mt-[10px] mr-[10px]" style={{ zIndex: 1000 }}>
        <div className="leaflet-control bg-white px-3 py-2 rounded-md shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span className={`w-2 h-2 rounded-full ${status.includes('🟢') ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            {status}
          </div>
        </div>
      </div>

      {/* Renderizado Optimizado */}
      {inspectores.map((ins) => (
        <InspectorMarker key={ins.inspector_id} data={ins} />
      ))}
    </>
  );
}