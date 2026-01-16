import { useState } from 'react';
import './FileUploadWithDrive.css';

const FileUploadWithDrive = ({ 
  onFilesSelect, 
  maxFiles = null,
  acceptedTypes = 'image/*,application/pdf'
}) => {
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const convertirArchivoBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    
    // Validar límite de archivos
    const totalArchivos = archivosSeleccionados.length + fileArray.length;
    if (maxFiles && totalArchivos > maxFiles) {
      alert(`⚠️ Máximo ${maxFiles} archivo(s) permitido(s)`);
      return;
    }

    let nuevosArchivos = [...archivosSeleccionados];

    for (const file of fileArray) {
      if (!archivosSeleccionados.find(f => f.file.name === file.name)) {
        try {
          const base64 = await convertirArchivoBase64(file);
          const nuevoArchivo = {
            file: file,
            base64: base64,
            nombre: file.name,
            tipo: file.type,
            tamaño: file.size,
            id: `${file.name}-${Date.now()}` // ID temporal
          };
          
          nuevosArchivos = [...nuevosArchivos, nuevoArchivo];
        } catch (error) {
          console.error('Error al procesar archivo:', error);
        }
      }
    }

    setArchivosSeleccionados(nuevosArchivos);
    onFilesSelect?.(nuevosArchivos);
  };

  const handleInputChange = async (e) => {
    handleFileSelect(e.target.files);
    e.target.value = ''; // Limpiar input
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const eliminarArchivo = (index) => {
    setArchivosSeleccionados(prev => {
      const nuevaLista = prev.filter((_, i) => i !== index);
      onFilesSelect?.(nuevaLista);
      return nuevaLista;
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (tipo) => {
    if (tipo.startsWith('image/')) return '🖼️';
    if (tipo === 'application/pdf') return '📄';
    return '📎';
  };

  return (
    <div className="file-upload-with-drive">
      <div className="form-group">
        <label>Archivos (Imágenes o PDFs):</label>
        
        <div
          className={`file-input-wrapper ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="archivos"
            accept={acceptedTypes}
            multiple
            onChange={handleInputChange}
            className="file-input"
          />
          <label htmlFor="archivos" className="file-input-label">
            📎 Seleccionar archivos (múltiples) o arrastrar aquí
          </label>
        </div>

        {archivosSeleccionados.length > 0 && (
          <div className="file-count">
            {archivosSeleccionados.length} archivo(s) seleccionado(s)
          </div>
        )}

        <div className="files-list">
          {archivosSeleccionados.map((archivo, index) => (
            <div key={archivo.id} className="file-item">
              <div className="file-info">
                <span className="file-icon">{getFileIcon(archivo.tipo)}</span>
                <div className="file-details">
                  <div className="file-name">{archivo.nombre}</div>
                  <div className="file-size">{formatBytes(archivo.tamaño)}</div>
                </div>
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={() => eliminarArchivo(index)}
              >
                ✕ Eliminar
              </button>
            </div>
          ))}
        </div>

        {/* Preview de imágenes */}
        <div className="file-preview">
          {archivosSeleccionados.map((archivo) => {
            if (archivo.tipo.startsWith('image/')) {
              return (
                <div key={archivo.id} className="preview-item">
                  <img src={archivo.base64} alt={archivo.nombre} />
                </div>
              );
            }
            if (archivo.tipo === 'application/pdf') {
              return (
                <div key={archivo.id} className="preview-pdf">
                  📄
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default FileUploadWithDrive;
