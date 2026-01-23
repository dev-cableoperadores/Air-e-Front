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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Proyecto {item.datos_ingreso?.OT_AIRE || item.id || ''}</h2>
        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
          <Button variant="primary" onClick={() => navigate(`/proyectos/${item.datos_ingreso?.OT_AIRE || item.id}/editar`)} className="w-full sm:w-auto text-xs sm:text-sm">Editar</Button>
          <Button variant="outline" onClick={() => navigate('/proyectos')} className="w-full sm:w-auto text-xs sm:text-sm">Volver</Button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-100/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 mx-2 sm:mx-0">
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Ingreso (OT_AIRE):</strong> <span className="text-gray-600 dark:text-gray-400">{item.datos_ingreso?.OT_AIRE}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Nombre proyecto:</strong> <span className="text-gray-600 dark:text-gray-400">{item.datos_ingreso?.nombre}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Inspector responsable:</strong> <span className="text-gray-600 dark:text-gray-400">{item.inspector_responsable?.user.username || item.inspector_responsable}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Fecha inspección:</strong> <span className="text-gray-600 dark:text-gray-400">{item.fecha_inspeccion ? formatDate(item.fecha_inspeccion) : ''}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Fecha análisis inspección:</strong> <span className="text-gray-600 dark:text-gray-400">{item.fecha_analisis_inspeccion ? formatDate(item.fecha_analisis_inspeccion) : ''}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Estado inicial:</strong> <span className="text-gray-600 dark:text-gray-400">{item.estado_inicial === 'gestionar_escritorio' ? 'Gestion desde Escritorio' : 'Gestion en sitio'}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Fecha de entrega:</strong> <span className="text-gray-600 dark:text-gray-400">{item.fecha_entrega_pj ? formatDate(item.fecha_entrega_pj) : ''}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Fecha de notificacion a PRST:</strong> <span className="text-gray-600 dark:text-gray-400">{item.fecha_notificacion_prst ? formatDate(item.fecha_notificacion_prst) : ''}</span></p>
        <p className="text-xs sm:text-sm"><strong className="font-semibold text-gray-700 dark:text-gray-300">Estado actual:</strong> <span className="text-gray-600 dark:text-gray-400">{item.estado_actual}</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
          {/* Cables */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-bold text-sm sm:text-base text-blue-900 dark:text-blue-300 border-b border-blue-300 dark:border-blue-600 pb-2 mb-3">Cables</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
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
