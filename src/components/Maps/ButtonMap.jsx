import { Link } from 'react-router-dom';
import Button from '../../components/UI/Button'

function ButtonMap() {
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '80px', marginRight: '10px' }}>
      <div className="leaflet-control leaflet-bar">
        <button
          type="button"
          onClick={() => window.location.href = '/inspecciones'}
          className="bg-white hover:bg-gray-100 text-gray-700 p-2 shadow-md flex items-center justify-center transition-colors"
          style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '20px' }}></span>
          <img src="public\angle-circle-left_6407320.svg" alt="" />
        </button>
      </div>
    </div>
  );
}

export default ButtonMap;