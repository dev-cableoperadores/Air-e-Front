import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useTracking(user) {
  // Usamos useRef para guardar la última vez que enviamos datos
  const lastUpdate = useRef(0);
  
  useEffect(() => {
    const userId = user?.id; // O user?.pk dependiendo de tu objeto Django
    if (!userId) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const now = Date.now();

        // 1. FILTRO DE PRECISIÓN: Si el error es > 50m, ignorar.
        if (accuracy > 50) return;

        // 2. THROTTLE: No enviar más de 1 vez cada 2 segundos
        if (now - lastUpdate.current < 2000) return;

        try {
          lastUpdate.current = now;
          
          await supabase
            .from('tracking_inspectores')
            .upsert({ 
              inspector_id: userId,
              nombre_inspector: user.first_name || user.username || 'Inspector',
              lat: latitude, 
              lng: longitude,
              ultima_actualizacion: new Date().toISOString(),
              en_linea: true
            }, { onConflict: 'inspector_id' }); // IMPORTANTE

        } catch (err) {
          console.error("Error envío GPS:", err);
        }
      },
      (err) => console.warn("Error GPS:", err.message),
      { 
        enableHighAccuracy: true, 
        distanceFilter: 5, // Más sensible (5 metros)
        timeout: 10000 
      }
    );

    // Limpieza al cerrar
    return () => {
      navigator.geolocation.clearWatch(watchId);
      // Intentar marcar offline (best effort)
      supabase.from('tracking_inspectores')
        .update({ en_linea: false })
        .eq('inspector_id', userId)
        .then(() => console.log("Inspector desconectado"));
    };
  }, [user]); // Solo reiniciar si cambia el usuario
}