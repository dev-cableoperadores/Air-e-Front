// hooks/useTracking.js
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTracking(user) {
  useEffect(() => {
    // 1. Usar el ID específicamente para evitar reinicios por cambios en otros campos del user
    const userId = user?.id;
    if (!userId) return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Opcional: No enviar si la precisión es muy mala (ej. > 100 metros)
        if (accuracy > 100) return; 

        try {
          await supabase
            .from('tracking_inspectores')
            .upsert({ 
              inspector_id: userId,
              nombre_inspector: user.first_name ? `${user.first_name} ${user.last_name}` : user.username,
              lat: latitude, 
              lng: longitude,
              ultima_actualizacion: new Date().toISOString(),
              en_linea: true
            }, { onConflict: 'inspector_id' });
        } catch (err) {
          console.error("Error al sincronizar con Supabase:", err);
        }
      },
      (error) => {
        const messages = {
          1: "Permiso de ubicación denegado.",
          2: "Ubicación no disponible.",
          3: "Tiempo de espera agotado."
        };
        console.warn(`GPS: ${messages[error.code] || error.message}`);
      },
      { 
        enableHighAccuracy: true, 
        distanceFilter: 10, // Solo dispara si se mueve 10 metros
        timeout: 15000     // No esperar más de 15s por una lectura
      }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      
      // Marcar offline al desmontar el componente
      supabase
        .from('tracking_inspectores')
        .update({ en_linea: false })
        .eq('inspector_id', userId)
        .then(() => { /* offline set */ });
    };
  }, [user?.id]); // <--- Cambio clave aquí
}