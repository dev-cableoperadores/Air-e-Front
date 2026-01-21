import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

function Postes() {
  const { cableoperadorId } = useParams()
  const navigate = useNavigate()
  const [postes, setPostes] = useState([])
  const [cableoperador, setCableoperador] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [center, setCenter] = useState([10.3932, -75.4898]) // Centro de Colombia (Atlántico)

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
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mapa de Postes</h1>
            {cableoperador && (
              <p className="text-gray-600">
                Cableoperador: <strong>{cableoperador.nombre_largo}</strong>
              </p>
            )}
            <p className="text-gray-600">Total de postes: {postes.length}</p>
          </div>
          {cableoperadorId && (
            <Link to={`/cableoperadores/${cableoperadorId}/detalle`}>
              <Button variant="outline">Volver</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden shadow">
        <MapContainer
          center={center}
          zoom={9}
          style={{ height: 'calc(100vh - 200px)', width: '100%' }}
        >
          {/* Capa visual del mapa (OpenStreetMap) */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Mapeo de los puntos sobre el mapa */}
          {postes.map(poste => (
            <Marker
              key={poste.id}
              position={[parseFloat(poste.coordenada_y), parseFloat(poste.coordenada_x)]}
            >
              <Popup className="w-64">
                <div className="text-sm">
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
                  <div className="mt-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/postes/${poste.id}/editar`)}
                    >Editar Poste</Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default Postes
