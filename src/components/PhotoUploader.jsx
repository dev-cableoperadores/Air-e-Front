// components/PhotoUploader.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from './UI/Button';

/**
 * Componente para subir fotos a Google Drive y obtener URLs
 */
function PhotoUploader({ 
  onUploadSuccess, 
  proyectoNombre, 
  inventarioId, 
  tipo = 'inventario',
  maxPhotos = 3,
  label = 'Subir Fotos'
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  // URL de tu Google Apps Script (debes desplegarla como Web App)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby84Mlj4HEOfZ1aMBGym1bOCgBKCUZS0AnquR1GntM5fUdfpwXjKs_vjEbeV_fIn56y/exec';

  /**
   * Convierte un archivo a base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo "data:image/jpeg;base64,"
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Sube un archivo a Google Drive
   */
  const uploadToGoogleDrive = async (file) => {
    try {
      const base64Data = await fileToBase64(file);

      const payload = {
        action: 'upload',
        fileName: file.name,
        fileData: base64Data,
        mimeType: file.type,
        proyectoNombre: proyectoNombre || 'Sin_Proyecto',
        inventarioId: inventarioId || 'temp',
        tipo: tipo
      };

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      });

      const result = await response.json();

      if (result.success) {
        return result.url;
      } else {
        throw new Error(result.error || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  };

  /**
   * Maneja la selección de archivos
   */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validar número máximo de fotos
    if (uploadedUrls.length + files.length > maxPhotos) {
      toast.error(`Solo puedes subir hasta ${maxPhotos} fotos`);
      return;
    }

    // Validar que sean imágenes
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 10MB por archivo)
    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Las imágenes deben ser menores a 10MB');
      return;
    }

    setUploading(true);

    try {
      const urls = [];

      for (const file of validFiles) {
        toast.loading(`Subiendo ${file.name}...`, { id: file.name });
        
        const url = await uploadToGoogleDrive(file);
        urls.push(url);

        toast.success(`✓ ${file.name} subido`, { id: file.name });
      }

      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);

      // Notificar al componente padre
      if (onUploadSuccess) {
        onUploadSuccess(newUrls);
      }

      toast.success(`${urls.length} foto(s) subida(s) exitosamente`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Error al subir fotos: ' + error.message);
    } finally {
      setUploading(false);
      // Limpiar el input
      e.target.value = '';
    }
  };

  /**
   * Elimina una URL de la lista
   */
  const handleRemoveUrl = (index) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    
    if (onUploadSuccess) {
      onUploadSuccess(newUrls);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Input de archivo */}
      <div className="flex items-center gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading || uploadedUrls.length >= maxPhotos}
            className="hidden"
          />
          <div
            className={`w-full px-4 py-2 border-2 border-dashed rounded-md text-center cursor-pointer transition
              ${uploading || uploadedUrls.length >= maxPhotos
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed'
                : 'bg-white dark:bg-gray-700 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600'
              }`}
          >
            {uploading ? (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ⏳ Subiendo fotos...
              </span>
            ) : uploadedUrls.length >= maxPhotos ? (
              <span className="text-sm text-gray-500 dark:text-gray-500">
                ✓ Máximo de fotos alcanzado ({maxPhotos})
              </span>
            ) : (
              <span className="text-sm text-blue-600 dark:text-blue-400">
                📷 Seleccionar fotos ({uploadedUrls.length}/{maxPhotos})
              </span>
            )}
          </div>
        </label>
      </div>

      {/* Vista previa de URLs subidas */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Fotos subidas ({uploadedUrls.length}):
          </p>
          <div className="grid grid-cols-1 gap-2">
            {uploadedUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
              >
                {/* Miniatura */}
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd" width="48" height="48"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E📷%3C/text%3E%3C/svg%3E';
                  }}
                />
                
                {/* URL (truncada) */}
                <div className="flex-1 min-w-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 dark:text-green-300 hover:underline block truncate"
                    title={url}
                  >
                    {url}
                  </a>
                </div>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(index)}
                  className="px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <p className="text-xs text-gray-500 dark:text-gray-500">
        💡 Las fotos se subirán a Google Drive automáticamente. Máximo {maxPhotos} fotos de 5MB cada una.
      </p>
    </div>
  );
}

export default PhotoUploader;