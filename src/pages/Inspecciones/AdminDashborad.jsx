import { MapContainer, TileLayer } from 'react-leaflet';
import MonitorRealtime from '../components/MonitorRealtime';

function AdminDashboard() {
  return (
    <div className="h-screen w-full">
      <MapContainer center={[10.98, -74.78]} zoom={13} className="h-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Aquí es donde ocurre la magia del tiempo real */}
        <MonitorRealtime />
        
      </MapContainer>
    </div>
  );
}