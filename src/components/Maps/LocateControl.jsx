import { useMap } from "react-leaflet";

function LocateControl() {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 17 });
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '80px', marginRight: '10px' }}>
      <div className="leaflet-control leaflet-bar">
        <button
          type="button"
          onClick={handleLocate}
          className="bg-white hover:bg-gray-100 text-gray-700 p-2 shadow-md flex items-center justify-center transition-colors"
          style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          title="Mi ubicación"
        >
          <span style={{ fontSize: '20px' }}>🎯</span>
        </button>
      </div>
    </div>
  );
}

export default LocateControl;