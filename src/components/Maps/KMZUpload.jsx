// components/KMZUpload.jsx
import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { getToken } from '../../services/authService'; // Ajustado a tu ruta real
import { uploadKMZData } from '../../services/kmzService';
import { parseKML, convertDjangoToFeatures } from '../../utils/kmlParser';

function KMZUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleKMZUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const cleanFileName = file.name.split('.').slice(0, -1).join('.');
    const token = getToken();
    if (!token) {
      setUploadStatus('✗ Error: No hay token de autenticación');
      return;
    }

    setUploading(true);
    setUploadStatus('Procesando archivo...');

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);

      // Buscar el archivo KML dentro del KMZ
      let kmlFile = null;
      for (let filename in contents.files) {
        if (filename.endsWith('.kml')) {
          kmlFile = contents.files[filename];
          break;
        }
      }

      if (!kmlFile) {
        throw new Error('No se encontró archivo KML en el KMZ');
      }

      const kmlString = await kmlFile.async('string');
      const features = parseKML(kmlString);

      if (features.length === 0) {
        throw new Error('No se encontraron elementos válidos en el archivo');
      }

      setUploadStatus(`${features.length} elementos encontrados. Guardando en Django...`);

      // Enviar datos a Django
      const response = await uploadKMZData({
        filename: cleanFileName,
        features: features
      }, token);

      // Convertir la respuesta de Django a formato de features
      const savedFeatures = convertDjangoToFeatures(response);

      setUploadStatus(`✓ ${savedFeatures.length} elementos guardados exitosamente en Django`);
      //console.log('Django response:', response);

      // Notificar al componente padre
      if (onUploadSuccess) {
        onUploadSuccess(savedFeatures);
      }
    } catch (error) {
      console.error('Error procesando KMZ:', error);
      setUploadStatus('✗ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
  // Dentro de tu componente, añade este useEffect
useEffect(() => {
  if (uploadStatus) {
    const timer = setTimeout(() => {
      setUploadStatus(null); // O setUploadStatus('') según como lo inicialices
    }, 4000); // 4 segundos de duración

    return () => clearTimeout(timer); // Limpieza si el componente se desmonta
  }
}, [uploadStatus]);
  return (
    <div className="kmz-upload-section">
      <h2>Cargar Archivo KMZ</h2>
      <input
        type="file"
        accept=".kmz"
        onChange={handleKMZUpload}
        disabled={uploading}
        className="file-input"
      />
      {uploadStatus && (
        <div className="fixed top-5 right-5 z-50 animate-fade-in-down"> 
          <div className={`
            px-6 py-3 rounded-lg shadow-2xl border-l-4 flex items-center space-x-2
            ${uploadStatus.includes('✓') 
              ? 'bg-green-100 border-green-500 text-green-800' 
              : uploadStatus.includes('✗') 
                ? 'bg-red-100 border-red-500 text-red-800' 
                : 'bg-blue-100 border-blue-500 text-blue-800'}
          `}>
            <span className="font-medium">{uploadStatus}</span>
            
            {/* Botón opcional para cerrar manualmente */}
            <button 
              onClick={() => setUploadStatus(null)}
              className="ml-4 text-lg font-bold opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KMZUpload;