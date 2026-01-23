// components/KMZUpload.jsx
import { useState } from 'react';
import JSZip from 'jszip';
import { getToken } from '../services/authService'; // Ajustado a tu ruta real
import { uploadKMZData } from '../services/kmzService';
import { parseKML, convertDjangoToFeatures } from '../utils/kmlParser';

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
      console.log('Django response:', response);

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
        <div className={`upload-status ${uploadStatus.includes('✓') ? 'success' : uploadStatus.includes('✗') ? 'error' : 'info'}`}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
}

export default KMZUpload;