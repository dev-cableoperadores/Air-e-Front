// components/PhotoUploader.jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby84Mlj4HEOfZ1aMBGym1bOCgBKCUZS0AnquR1GntM5fUdfpwXjKs_vjEbeV_fIn56y/exec';

/* ─────────────────────────────────────────────
   ANNOTATION EDITOR
   ───────────────────────────────────────────── */
function AnnotationEditor({ imageDataUrl, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('arrow'); // arrow | line | rect | circle | freehand | text
  const [color, setColor] = useState('#ef4444');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null); // temp canvas for live preview
  const freehandPoints = useRef([]);

  // Load image onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      // Fit inside 800x600
      const maxW = Math.min(800, window.innerWidth - 48);
      const maxH = Math.min(600, window.innerHeight - 220);
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      overlayRef.current.width = canvas.width;
      overlayRef.current.height = canvas.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      imageRef.current = img;
      setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const drawArrow = (ctx, x1, y1, x2, y2) => {
    const headLen = 18;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const drawShape = (ctx, tool, x1, y1, x2, y2, points) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (tool === 'arrow') {
      drawArrow(ctx, x1, y1, x2, y2);
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.beginPath();
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else if (tool === 'circle') {
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const cx = x1 + (x2 - x1) / 2;
      const cy = y1 + (y2 - y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'freehand' && points && points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
  };

  const onMouseDown = (e) => {
    if (tool === 'text') {
      const pos = getPos(e);
      setTextPos(pos);
      return;
    }
    const pos = getPos(e);
    setStartPos(pos);
    setIsDrawing(true);
    if (tool === 'freehand') freehandPoints.current = [pos];
  };

  const onMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const overlay = overlayRef.current;
    const octx = overlay.getContext('2d');
    octx.clearRect(0, 0, overlay.width, overlay.height);

    if (tool === 'freehand') {
      freehandPoints.current.push(pos);
      drawShape(octx, 'freehand', 0, 0, 0, 0, freehandPoints.current);
    } else {
      drawShape(octx, tool, startPos.x, startPos.y, pos.x, pos.y);
    }
  };

  const onMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'freehand') {
      freehandPoints.current.push(pos);
      drawShape(ctx, 'freehand', 0, 0, 0, 0, freehandPoints.current);
      freehandPoints.current = [];
    } else {
      drawShape(ctx, tool, startPos.x, startPos.y, pos.x, pos.y);
    }

    const overlay = overlayRef.current;
    overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
    setHistory((h) => [...h, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const addText = () => {
    if (!textPos || !textInput.trim()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${lineWidth * 6 + 12}px sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeText(textInput, textPos.x, textPos.y);
    ctx.fillText(textInput, textPos.x, textPos.y);
    setHistory((h) => [...h, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    setTextInput('');
    setTextPos(null);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    const canvas = canvasRef.current;
    canvas.getContext('2d').putImageData(newHistory[newHistory.length - 1], 0, 0);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const overlay = overlayRef.current;
    
    // Transferir contenido del overlay al canvas si hay algo pendiente
    ctx.drawImage(overlay, 0, 0);
    overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `anotado_${Date.now()}.png`, { type: 'image/png' });
      onSave(file, canvas.toDataURL('image/png'));
    }, 'image/png');
  };

  const tools = [
    { id: 'arrow', label: '↗', title: 'Flecha' },
    { id: 'line', label: '╱', title: 'Línea' },
    { id: 'rect', label: '▭', title: 'Rectángulo' },
    { id: 'circle', label: '○', title: 'Círculo/Elipse' },
    { id: 'freehand', label: '✏️', title: 'Dibujo libre' },
    { id: 'text', label: 'T', title: 'Texto' },
  ];

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ffffff', '#000000'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl flex flex-col gap-3 p-4 max-w-[860px] w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">✏️ Editor de Anotaciones</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center bg-gray-800 rounded-xl p-2">
          {/* Tools */}
          <div className="flex gap-1">
            {tools.map((t) => (
              <button
                type='button'
                key={t.id}
                title={t.title}
                onClick={() => setTool(t.id)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  tool === t.id
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-600" />

          {/* Colors */}
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-8 bg-gray-600" />

          {/* Line width */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Grosor</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20 accent-blue-500"
            />
            <span className="text-gray-300 text-xs w-4">{lineWidth}</span>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={history.length <= 1}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-40 transition-all"
            >
              ↩ Deshacer
            </button>
          </div>
        </div>

        {/* Text input (only when text tool) */}
        {tool === 'text' && (
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={textPos ? 'Escribe el texto y presiona Agregar' : 'Primero haz clic en el canvas'}
              className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addText()}
            />
            <button
              type="button"
              onClick={addText}
              disabled={!textPos || !textInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-blue-500 transition-all"
            >
              Agregar
            </button>
            {textPos && (
              <span className="text-gray-400 text-xs self-center">
                📍 ({Math.round(textPos.x)}, {Math.round(textPos.y)})
              </span>
            )}
          </div>
        )}

        {/* Canvas area */}
        <div
          className="relative overflow-auto rounded-xl bg-gray-950 flex justify-center"
          style={{ maxHeight: '55vh' }}
        >
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              className="block rounded-xl"
              style={{ cursor: tool === 'text' ? 'text' : 'crosshair', touchAction: 'none' }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => isDrawing && onMouseUp({ clientX: 0, clientY: 0 })}
              onTouchStart={onMouseDown}
              onTouchMove={onMouseMove}
              onTouchEnd={onMouseUp}
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 pointer-events-none rounded-xl"
            />
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center">
          {tool === 'text'
            ? '👆 Haz clic en la imagen para posicionar el texto'
            : '👆 Haz clic y arrastra para dibujar'}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-bold shadow-lg shadow-blue-900/40"
          >
            ✓ Guardar anotación
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CAMERA MODAL
   ───────────────────────────────────────────── */
function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async (facing) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setReady(true);
    } catch {
      toast.error('No se pudo acceder a la cámara');
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    startCamera(facingMode);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCapture(file, dataUrl);
    }, 'image/jpeg', 0.92);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full max-w-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full block"
          style={{ maxHeight: '70vh', objectFit: 'cover' }}
        />

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-8 border-2 border-white/30 rounded-xl" />
          <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
          <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
          <div className="absolute bottom-20 left-8 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
          <div className="absolute bottom-20 right-8 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-8 py-5 bg-black/60 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center text-xl hover:bg-white/20 transition-all"
          >
            ✕
          </button>

          <button
            onClick={capture}
            disabled={!ready}
            className="w-16 h-16 rounded-full bg-white border-4 border-white/30 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
          />

          <button
            
            onClick={flipCamera}
            className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center text-xl hover:bg-white/20 transition-all"
            title="Voltear cámara"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
function PhotoUploader({
  onUploadSuccess,
  proyectoNombre,
  inventarioId,
  tipo = 'inventario',
  maxPhotos = 3,
  label = 'Fotos',
  required = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null); // { file, dataUrl }
  const [previews, setPreviews] = useState([]); // local data URLs for thumbnails
  const fileInputRef = useRef(null);

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });

  const uploadToGoogleDrive = async (file) => {
    const base64Data = await fileToBase64(file);
    const payload = {
      action: 'upload',
      fileName: file.name,
      fileData: base64Data,
      mimeType: file.type,
      proyectoNombre: proyectoNombre || 'Sin_Proyecto',
      inventarioId: inventarioId || 'temp',
      tipo,
    };
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    const result = await response.json();
    if (result.success) return result.url;
    throw new Error(result.error || 'Error al subir archivo');
  };

  const processFiles = async (files, dataUrls = []) => {
    if (uploadedUrls.length + files.length > maxPhotos) {
      toast.error(`Solo puedes subir hasta ${maxPhotos} fotos`);
      return;
    }

    setUploading(true);
    try {
      const urls = [];
      const newPreviews = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        toast.loading(`Subiendo ${file.name}...`, { id: file.name });
        const url = await uploadToGoogleDrive(file);
        urls.push(url);
        newPreviews.push(dataUrls[i] || URL.createObjectURL(file));
        toast.success(`✓ ${file.name}`, { id: file.name });
      }

      const newUrls = [...uploadedUrls, ...urls];
      const newPrevs = [...previews, ...newPreviews];
      setUploadedUrls(newUrls);
      setPreviews(newPrevs);
      onUploadSuccess?.(newUrls);
      toast.success(`${urls.length} foto(s) subida(s)`);
    } catch (error) {
      toast.error('Error al subir: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;

    const invalid = files.filter((f) => !f.type.startsWith('image/'));
    if (invalid.length) { toast.error('Solo imágenes'); return; }
    const big = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (big.length) { toast.error('Máximo 10MB por imagen'); return; }

    await processFiles(files);
  };

  const handleCameraCapture = (file, dataUrl) => {
    setShowCamera(false);
    // Offer to edit before uploading
    setEditingPhoto({ file, dataUrl });
  };

  const handleEditSave = async (annotatedFile, annotatedDataUrl) => {
    setEditingPhoto(null);
    await processFiles([annotatedFile], [annotatedDataUrl]);
  };

  const handleEditFromGallery = (index) => {
    // Re-edit from preview (local data url)
    const dataUrl = previews[index];
    if (!dataUrl) { toast.error('Vista previa no disponible para reeditar'); return; }
    // We create a dummy editing session; on save we replace
    setEditingPhoto({ file: null, dataUrl, replaceIndex: index });
  };

  const handleEditSaveReplace = async (annotatedFile, annotatedDataUrl, replaceIndex) => {
    setEditingPhoto(null);
    if (replaceIndex !== undefined) {
      // Remove old entry and upload new
      const newUrls = uploadedUrls.filter((_, i) => i !== replaceIndex);
      const newPrevs = previews.filter((_, i) => i !== replaceIndex);
      setUploadedUrls(newUrls);
      setPreviews(newPrevs);
    }
    await processFiles([annotatedFile], [annotatedDataUrl]);
  };

  const handleRemove = (index) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    const newPrevs = previews.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
    setPreviews(newPrevs);
    onUploadSuccess?.(newUrls);
  };

  const canAdd = uploadedUrls.length < maxPhotos && !uploading;

  return (
    <>
      {/* Camera Modal */}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Annotation Editor */}
      {editingPhoto && (
        <AnnotationEditor
          imageDataUrl={editingPhoto.dataUrl}
          onSave={(file, dataUrl) => {
            if (editingPhoto.replaceIndex !== undefined) {
              handleEditSaveReplace(file, dataUrl, editingPhoto.replaceIndex);
            } else {
              handleEditSave(file, dataUrl);
            }
          }}
          onClose={() => {
            // If came from camera, still upload original
            if (editingPhoto.file && editingPhoto.replaceIndex === undefined) {
              processFiles([editingPhoto.file]);
            }
            setEditingPhoto(null);
          }}
        />
      )}

      {/* Main UI */}
      <div className="flex flex-col gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
          {required && <span className="text-red-500 text-sm">*</span>}
          <span className="ml-auto text-xs text-gray-400">{uploadedUrls.length}/{maxPhotos}</span>
        </div>

        {/* Action buttons */}
        {canAdd && (
          <div className="flex gap-2">
            {/* Upload from file */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium text-sm hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all"
            >
              <span className="text-lg">🖼️</span>
              <span>Galería</span>
            </button>

            {/* Camera */}
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-all"
            >
              <span className="text-lg">📷</span>
              <span>Cámara</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Uploading indicator */}
        {uploading && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Subiendo a Google Drive...</span>
          </div>
        )}

        {/* Photo grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((previewUrl, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm">
                <img
                  src={previewUrl}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = ''; }}
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    
                    onClick={() => handleEditFromGallery(index)}
                    className="px-3 py-1.5 bg-white/90 text-gray-800 rounded-lg text-xs font-bold hover:bg-white transition-all"
                  >
                    ✏️ Anotar
                  </button>
                  <button
                    
                    onClick={() => handleRemove(index)}
                    className="px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-all"
                  >
                    🗑️ Eliminar
                  </button>
                </div>

                {/* Index badge */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* Upload success checkmark */}
                {uploadedUrls[index] && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Max reached */}
        {uploadedUrls.length >= maxPhotos && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <span className="text-green-600 dark:text-green-400 text-sm">✓ {maxPhotos} fotos subidas</span>
          </div>
        )}

        {/* Hint */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          💡 Sube desde galería o toma una foto con la cámara. Puedes anotar con flechas, líneas y texto antes o después de subir.
        </p>
      </div>
    </>
  );
}

export default PhotoUploader;