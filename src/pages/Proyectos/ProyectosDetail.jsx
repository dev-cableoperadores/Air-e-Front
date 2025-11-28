import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import proyectosService from '../../services/proyectosService'
import Button from '../../components/UI/Button'
import Loading from '../../components/UI/Loading'
import { formatDate } from '../../utils/formatters'

const ProyectosDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await proyectosService.getProyectoById(id)
        setItem(data)
      } catch (err) {
        toast.error('Error al cargar proyecto')
        navigate('/proyectos')
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading || !item) return <Loading fullScreen />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Proyecto {item.datos_ingreso?.OT_AIRE || item.id || ''}</h2>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => navigate(`/proyectos/${item.datos_ingreso?.OT_AIRE || item.id}/editar`)}>Editar</Button>
          <Button variant="outline" onClick={() => navigate('/proyectos')}>Volver</Button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 space-y-3">
        <p><strong>Ingreso (OT_AIRE):</strong> {item.datos_ingreso?.OT_AIRE}</p>
        <p><strong>Nombre proyecto:</strong> {item.datos_ingreso?.nombre}</p>
        <p><strong>Inspector responsable:</strong> {item.inspector_responsable?.user.username || item.inspector_responsable}</p>
        <p><strong>Fecha inspección:</strong> {item.fecha_inspeccion ? formatDate(item.fecha_inspeccion) : ''}</p>
        <p><strong>Fecha análisis inspección:</strong> {item.fecha_analisis_inspeccion ? formatDate(item.fecha_analisis_inspeccion) : ''}</p>
        <p><strong>Estado inicial:</strong> {item.estado_inicial === 'gestionar_escritorio' ? 'Gestion desde Escritorio' : 'Gestion en sitio'}</p>
        <p><strong>Fecha de entrega:</strong> {item.fecha_entrega_pj ? formatDate(item.fecha_entrega_pj) : ''}</p>
        <p><strong>Fecha de notificacion a PRST:</strong> {item.fecha_notificacion_prst ? formatDate(item.fecha_notificacion_prst) : ''}</p>
        <p><strong>Estado actual:</strong> {item.estado_actual}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cables */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h4 className="font-bold text-lg text-indigo-700 border-b pb-2 mb-3">Cables</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* 1. Filtramos las claves que empiezan por 'tip' para ignorar 'proyecto'
              2. Iteramos y desestructuramos [k, v]
            */}
            {item.nap && Object.entries(item.cable).map(([k, v]) => {
              
              // Función de transformación: 'tip8' -> 'Tipo 8'
              const getNapLabel = (key) => {
                // Aseguramos que solo procesamos las claves 'tipX'
                if (key.startsWith('tipo')) {
                  const numericPart = key.replace('tipo', '');
                  return `Altura ${numericPart}m`;
                }
                return null; 
              };

              const displayLabel = getNapLabel(k);

              // Solo renderizamos si es una clave de tipo (tipX)
              if (displayLabel) {
                return (
                  <div 
                    key={k} 
                    className={`p-3 rounded-md transition-all 
                                ${v > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className="text-xs font-medium text-gray-500">{displayLabel}</p>
                    {/* Si el valor es 0, mostramos '-' para limpieza, si no, mostramos el valor */}
                    <p className="font-extrabold text-xl text-gray-900 mt-0.5">
                      {v > 0 ? v : '-'}
                    </p>
                  </div>
                );
              }
              return null;
            })}
            </div>
          </div>
          {/* Caja Empalme */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h4 className="font-bold text-lg text-indigo-700 border-b pb-2 mb-3">Caja Empalme</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* 1. Filtramos las claves que empiezan por 'tip' para ignorar 'proyecto'
              2. Iteramos y desestructuramos [k, v]
            */}
            {item.nap && Object.entries(item.caja_empalme).map(([k, v]) => {
              
              // Función de transformación: 'tip8' -> 'Tipo 8'
              const getNapLabel = (key) => {
                // Aseguramos que solo procesamos las claves 'tipX'
                if (key.startsWith('tipo')) {
                  const numericPart = key.replace('tipo', '');
                  return `Altura ${numericPart}m`;
                }
                return null; 
              };

              const displayLabel = getNapLabel(k);

              // Solo renderizamos si es una clave de tipo (tipX)
              if (displayLabel) {
                return (
                  <div 
                    key={k} 
                    className={`p-3 rounded-md transition-all 
                                ${v > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className="text-xs font-medium text-gray-500">{displayLabel}</p>
                    {/* Si el valor es 0, mostramos '-' para limpieza, si no, mostramos el valor */}
                    <p className="font-extrabold text-xl text-gray-900 mt-0.5">
                      {v > 0 ? v : '-'}
                    </p>
                  </div>
                );
              }
              return null;
            })}
            </div>
          </div>
          {/* Reserva */}
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h4 className="font-bold text-lg text-indigo-700 border-b pb-2 mb-3">Reserva</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* 1. Filtramos las claves que empiezan por 'tipo' para ignorar 'proyecto'
              2. Iteramos y desestructuramos [k, v]
            */}
            {item.nap && Object.entries(item.reserva).map(([k, v]) => {
              
              // Función de transformación: 'tip8' -> 'Tipo 8'
              const getNapLabel = (key) => {
                // Aseguramos que solo procesamos las claves 'tipX'
                if (key.startsWith('tipo')) {
                  const numericPart = key.replace('tipo', '');
                  return `Altura ${numericPart}m`;
                }
                return null; 
              };

              const displayLabel = getNapLabel(k);

              // Solo renderizamos si es una clave de tipo (tipX)
              if (displayLabel) {
                return (
                  <div 
                    key={k} 
                    className={`p-3 rounded-md transition-all 
                                ${v > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className="text-xs font-medium text-gray-500">{displayLabel}</p>
                    {/* Si el valor es 0, mostramos '-' para limpieza, si no, mostramos el valor */}
                    <p className="font-extrabold text-xl text-gray-900 mt-0.5">
                      {v > 0 ? v : '-'}
                    </p>
                  </div>
                );
              }
              return null;
            })}
            </div>
          </div>
        {/* Cajas Nap */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
  
          <h4 className="font-bold text-lg text-indigo-700 border-b pb-2 mb-3">
            Cajas NAP
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* 1. Filtramos las claves que empiezan por 'tip' para ignorar 'proyecto'
              2. Iteramos y desestructuramos [k, v]
            */}
            {item.nap && Object.entries(item.nap).map(([k, v]) => {
              
              // Función de transformación: 'tip8' -> 'Tipo 8'
              const getNapLabel = (key) => {
                // Aseguramos que solo procesamos las claves 'tipX'
                if (key.startsWith('tipo')) {
                  const numericPart = key.replace('tipo', '');
                  return `Altura ${numericPart}m`;
                }
                return null; 
              };

              const displayLabel = getNapLabel(k);

              // Solo renderizamos si es una clave de tipo (tipX)
              if (displayLabel) {
                return (
                  <div 
                    key={k} 
                    className={`p-3 rounded-md transition-all 
                                ${v > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className="text-xs font-medium text-gray-500">{displayLabel}</p>
                    {/* Si el valor es 0, mostramos '-' para limpieza, si no, mostramos el valor */}
                    <p className="font-extrabold text-xl text-gray-900 mt-0.5">
                      {v > 0 ? v : '-'}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          {/* Opcional: Mostrar la OT principal como un pie de página sutil */}
          {item.nap && item.nap.proyecto && (
            <p className="mt-4 text-xs text-right text-gray-400">
              OT: {item.nap.proyecto}
            </p>
          )}
        </div>
        </div>
        {/* Altura final Poste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <h4 className="font-bold text-lg text-indigo-700 border-b pb-2 mb-3">Altura Final Poste</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* 1. Filtramos las claves que empiezan por 'tip' para ignorar 'proyecto'
              2. Iteramos y desestructuramos [k, v]
            */}
            {item.nap && Object.entries(item.altura_final_poste).map(([k, v]) => {
              
              // Función de transformación: 'tip8' -> 'Tipo 8'
              const getNapLabel = (key) => {
                // Aseguramos que solo procesamos las claves 'tipX'
                if (key.startsWith('tipo')) {
                  const numericPart = key.replace('tipo', '');
                  return `Altura ${numericPart}m`;
                }
                return null; 
              };

              const displayLabel = getNapLabel(k);

              // Solo renderizamos si es una clave de tipo (tipX)
              if (displayLabel) {
                return (
                  <div 
                    key={k} 
                    className={`p-3 rounded-md transition-all 
                                ${v > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <p className="text-xs font-medium text-gray-500">{displayLabel}</p>
                    {/* Si el valor es 0, mostramos '-' para limpieza, si no, mostramos el valor */}
                    <p className="font-extrabold text-xl text-gray-900 mt-0.5">
                      {v > 0 ? v : '-'}
                    </p>
                  </div>
                );
              }
              return null;
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProyectosDetail
