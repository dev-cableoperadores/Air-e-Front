import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents  } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import postesService from '../../services/postesService'
import cableoperadoresService from '../../services/cableoperadoresService'
import Loading from '../../components/UI/Loading'
import Button from '../../components/UI/Button'

// Corregir el ícono de leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function ClickHandler({ setExtraMarker }) {
  useMapEvents({
    click(e) {
      setExtraMarker([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}


function Postes() {
  const { cableoperadorId } = useParams()
  const navigate = useNavigate()
  const [postes, setPostes] = useState([])
  const [cableoperador, setCableoperador] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [center, setCenter] = useState([10.3932, -75.4898]) // Centro de Colombia (Atlántico)
  const [extraMarker, setExtraMarker] = useState(null)

  useEffect(() => {
    loadPostes()
  }, [cableoperadorId])

  const loadPostes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let data
      if (cableoperadorId) {
        // Cargar postes de un cableoperador específico
        data = await postesService.getByCableoperador(cableoperadorId)
        // Cargar info del cableoperador
        const cableOp = await cableoperadoresService.getById(cableoperadorId)
        setCableoperador(cableOp)
      } else {
        // Cargar todos los postes
        data = await postesService.getAll()
      }

      const postesArray = Array.isArray(data) ? data : data.results || data.data || []
      setPostes(postesArray)

      // Calcular el centro del mapa basado en los postes
      if (postesArray.length > 0) {
        const latitudes = postesArray
          .map(p => parseFloat(p.coordenada_y))
          .filter(lat => !isNaN(lat))
        const longitudes = postesArray
          .map(p => parseFloat(p.coordenada_x))
          .filter(lon => !isNaN(lon))

        if (latitudes.length > 0 && longitudes.length > 0) {
          const avgLat = latitudes.reduce((a, b) => a + b) / latitudes.length
          const avgLon = longitudes.reduce((a, b) => a + b) / longitudes.length
          setCenter([avgLat, avgLon])
        }
      }
    } catch (err) {
      console.error('Error loading postes:', err)
      setError('Error al cargar los postes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded text-center text-sm sm:text-base">
          {error}
        </div>
      </div>
    )
  }
  function AddMarkerForm({ setExtraMarker }) {
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isNaN(lat) && !isNaN(lng)) {
      setExtraMarker([parseFloat(lat), parseFloat(lng)])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 p-2 sm:p-0">
      <input 
        type="text" 
        placeholder="Latitud" 
        value={lat} 
        onChange={e => setLat(e.target.value)}
        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input 
        type="text" 
        placeholder="Longitud" 
        value={lng} 
        onChange={e => setLng(e.target.value)}
        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit" className="w-full sm:w-auto text-xs sm:text-sm">Añadir marcador</Button>
    </form>
  )
}
  return (
    <div className="w-full h-full space-y-3 sm:space-y-4 p-2 sm:p-0">
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 shadow rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Mapa de Postes</h1>
            {cableoperador && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                📍 <strong>{cableoperador.nombre_largo}</strong>
              </p>
            )}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total: {postes.length} postes</p>
          </div>
          {cableoperadorId && (
            <Link to={`/cableoperadores/${cableoperadorId}/detalle`}>
              <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">← Volver</Button>
            </Link>
          )}
        </div>
      </div>
      <AddMarkerForm setExtraMarker={setExtraMarker} />
      <div className="rounded-lg overflow-hidden shadow">
        <MapContainer center={center} zoom={9} style={{ height: 'calc(100vh - 250px)', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <ClickHandler setExtraMarker={setExtraMarker} />

          {postes.map(poste => (
            <Marker
              key={poste.id}
              position={[parseFloat(poste.coordenada_y), parseFloat(poste.coordenada_x)]}
            >
              <Popup className="w-64">
                <div className="text-xs sm:text-sm space-y-1">
                  <strong>Tipo coordenada:</strong> {poste.tipo_coordenada} <br />
                  <strong>Código:</strong> {poste.codigo_poste} <br />
                  <strong>Material:</strong> {poste.material_poste || 'N/A'} <br />
                  <strong>Tipo:</strong> {poste.tipo_poste || 'N/A'} <br />
                  <strong>Altura:</strong> {poste.altura_poste || 'N/A'}m <br />
                  <strong>Estado:</strong> {poste.estado_proyecto} <br />
                  <strong>Municipio:</strong> {poste.municipio || 'N/A'} <br />
                  <strong>Cable Operador:</strong> {poste.cableoperador?.nombre || 'N/A'} <br />
                  <strong>Tipo Elemento:</strong> {poste.tipo_elemento || 'N/A'} <br />
                  <strong>Proyecto:</strong> {poste.nombre_proyecto || 'N/A'} <br />
                  {poste.observaciones && (
                    <>
                      <strong>Observaciones:</strong> {poste.observaciones} <br />
                    </>
                  )}
                  <strong>Coordenadas:</strong> {poste.coordenada_y}, {poste.coordenada_x}
                  {/* Modal para editar poste */}
                  <div className="mt-2 flex flex-col sm:flex-row gap-1\">
                      {cableoperadorId ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/postes/cableoperador/${cableoperadorId}/${poste.id}/editar`)}
                        className="text-xs w-full sm:w-auto"
                      >✏️ Editar</Button>) : (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/postes/${poste.id}/editar`)}
                        className="text-xs w-full sm:w-auto"
                      >✏️ Editar</Button>
                      )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {extraMarker && (
            <Marker position={extraMarker}>
              <Popup className="w-64">
                <div className="text-sm">
                  <strong>Marcador personalizado</strong><br />
                  <strong>Coordenadas:</strong> {extraMarker[0]}, {extraMarker[1]}<br />
                  <em>Haz clic en un poste existente para ver su información completa</em>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
              
      </div>
    </div>
  )
}

export default Postes
