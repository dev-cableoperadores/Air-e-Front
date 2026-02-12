import { MapContainer, TileLayer } from 'react-leaflet';
import MonitorRealtime from '../../components/Maps/MonitorRealtime';

function AdminDashboard() {
  return (
    <div className="h-screen w-full">
      <MapContainer center={[10.98, -74.78]} zoom={13} maxZoom={22} className="h-full" scrollWheelZoom={true}
  preferCanvas={true}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}      // Límite lógico
            maxNativeZoom={18}
            
          />
        
        {/* Aquí es donde ocurre la magia del tiempo real */}
        <MonitorRealtime />
        
      </MapContainer>
    </div>
  );
}
export default AdminDashboard;