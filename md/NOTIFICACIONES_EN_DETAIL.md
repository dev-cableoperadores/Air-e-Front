# 📋 Notificaciones en CableOperadores/Detail.jsx

## ✅ Implementación Completada

Las notificaciones ahora están **integradas directamente en el componente `Detail.jsx` de CableOperadores**, usando los endpoints existentes en `cableoperadoresService.js`.

---

## 📁 Estructura

```
src/
├── services/
│   ├── cableoperadoresService.js         ✅ Ya tiene los endpoints
│   │   ├── getNotificaciones(id)        ✅ Obtener notificaciones
│   │   └── postNotificaciones(id, data) ✅ Crear notificación
│   └── (otros servicios...)
├── pages/
│   └── CableOperadores/
│       └── Detail.jsx                    ✅ ACTUALIZADO - Incluye notificaciones
├── components/
│   └── UI/
│       ├── FileUploadWithDrive.jsx       ✅ Componente de upload
│       ├── FileUploadWithDrive.css       ✅ Estilos
│       └── (otros componentes...)
└── App.jsx                               ✅ ACTUALIZADO
```

---

## 🎯 Características en Detail.jsx

### 1. **Crear Notificación**
```
✅ Seleccionar tipo de notificación
✅ Seleccionar fecha
✅ Upload múltiple de archivos (drag & drop)
✅ Subir a Google Drive automáticamente
✅ Guardar en Django con URLs de archivos
```

### 2. **Ver Notificaciones**
```
✅ Listar todas las notificaciones del cableoperador
✅ Mostrar tipo y fecha
✅ Mostrar archivos adjuntos
✅ Links directos a descargar desde Google Drive
```

---

## 🔗 Flujo de Creación de Notificación

```
1. Usuario va a CableOperadores → Detail
2. Sección "Nueva Notificación"
3. Selecciona tipo_notificacion
4. Selecciona fecha
5. Sube archivos (drag & drop o click)
6. Click "Crear Notificación con Archivos"
7. Archivos se convierten a base64 en navegador
8. Se envían a Google Apps Script
9. Google Drive sube archivos y retorna URLs
10. Se crea Notificación en Django con las URLs
11. Se recargan notificaciones automáticamente
12. ✅ Éxito con mensaje
```

---

## 🔑 Endpoints Usados

```javascript
// En cableoperadoresService.js

// Obtener notificaciones de un cableoperador
getNotificaciones(cableoperadorId)
// GET /api/cableoperadores/{id}/notificaciones/

// Crear notificación para un cableoperador
postNotificaciones(cableoperadorId, notificacionData)
// POST /api/cableoperadores/{id}/notificaciones/
```

---

## 📦 Estructura de Datos

### Crear Notificación
```javascript
{
  tipo_notificacion: "cobro_multa",
  fecha: "2025-01-16",
  ruta: [
    {
      nombre: "documento.pdf",
      url: "https://drive.google.com/file/d/.../view",
      tipo: "application/pdf",
      tamaño: 1024,
      id: "file_id",
      fechaSubida: "2025-01-16T10:30:00Z"
    }
  ]
}
```

### Respuesta de Notificación
```javascript
{
  id: 1,
  cableoperador: 5,
  tipo_notificacion: "cobro_multa",
  fecha: "2025-01-16",
  ruta: [...],
  created_at: "2025-01-16T10:30:00Z",
  updated_at: "2025-01-16T10:30:00Z"
}
```

---

## 🧩 Componentes Reutilizables

### FileUploadWithDrive.jsx
Componente para seleccionar y visualizar archivos antes de enviar.

**Props:**
```jsx
<FileUploadWithDrive
  onFilesSelect={(files) => setArchivosSeleccionados(files)}
  acceptedTypes="image/*,application/pdf"
/>
```

**Retorna:**
```javascript
{
  file: File,                    // Objeto File original
  base64: "data:image/png;...",  // Codificación base64
  nombre: "archivo.jpg",         // Nombre del archivo
  tipo: "image/jpeg",            // Tipo MIME
  tamaño: 1024,                  // Tamaño en bytes
  id: "unique_id"                // ID temporal único
}
```

---

## 💾 Estado en Detail.jsx

```javascript
const [archivosSeleccionados, setArchivosSeleccionados] = useState([])
const [enviandoNotificacion, setEnviandoNotificacion] = useState(false)
const [notificaciones, setNotificaciones] = useState({
  count: 0,
  next: null,
  previous: null,
  results: [],
})
```

---

## 🚀 Cómo Usar

### 1. **Navegar a un Cableoperador**
```
Click en: Cableoperadores → Ver detalle
```

### 2. **Crear Notificación**
```
Sección "Nueva Notificación"
├─ Seleccionar tipo_notificacion
├─ Seleccionar fecha
├─ Upload archivos (1+ archivos)
└─ Click "Crear Notificación con Archivos"
```

### 3. **Ver Notificaciones**
```
Sección "Historial de Notificaciones"
├─ Mostrar todas las notificaciones
├─ Mostrar archivos con links de descarga
└─ Click para descargar desde Google Drive
```

---

## ⚙️ Configuración

### Variables de Entorno
```env
# .env o .env.local
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## 🐛 Manejo de Errores

```javascript
// Validación
if (archivosSeleccionados.length === 0) {
  toast.error('⚠️ Por favor seleccione al menos un archivo')
  return
}

// Errores de Drive
if (!driveData.success) {
  throw new Error(driveData.error)
}

// Errores de Django
try {
  await cableoperadoresService.postNotificaciones(...)
} catch (error) {
  // Mostrar mensaje legible
  toast.error(message)
}
```

---

## 🎨 UI/UX

### Visual
- ✅ Drag & drop para archivos
- ✅ Previsualización de imágenes
- ✅ Información de archivos (nombre, tamaño)
- ✅ Botón eliminar para cada archivo
- ✅ Contador de archivos seleccionados

### Feedback
- ✅ Mensajes de éxito/error
- ✅ Spinner mientras se procesa
- ✅ Recarga automática de notificaciones
- ✅ Limpieza del formulario después de crear

---

## 📝 Ejemplo de Uso Completo

```jsx
import { useState, useEffect } from 'react'
import cableoperadoresService from '../../services/cableoperadoresService'
import FileUploadWithDrive from '../../components/UI/FileUploadWithDrive'

function MiComponente() {
  const [archivos, setArchivos] = useState([])
  const [notificaciones, setNotificaciones] = useState([])

  // Cargar notificaciones
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await cableoperadoresService.getNotificaciones(cableoperadorId)
        setNotificaciones(data.results || [])
      } catch (error) {
        console.error('Error:', error)
      }
    }
    cargar()
  }, [cableoperadorId])

  // Crear notificación
  const handleCrear = async (e) => {
    e.preventDefault()
    
    // Aquí iría la lógica para subir a Google Drive
    // y luego crear la notificación en Django
    
    const notificacionData = {
      tipo_notificacion: 'cobro_multa',
      fecha: '2025-01-16',
      ruta: archivos // Array de objetos con URLs de Drive
    }

    try {
      await cableoperadoresService.postNotificaciones(cableoperadorId, notificacionData)
      // Recargar
      const data = await cableoperadoresService.getNotificaciones(cableoperadorId)
      setNotificaciones(data.results || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <>
      <FileUploadWithDrive onFilesSelect={setArchivos} />
      
      <div>
        {notificaciones.map(n => (
          <div key={n.id}>
            <h4>{n.tipo_notificacion}</h4>
            {Array.isArray(n.ruta) && n.ruta.map(a => (
              <a key={a.id} href={a.url} target="_blank">
                {a.nombre}
              </a>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
```

---

## ✨ Ventajas de Esta Integración

✅ **Menos Código**: Una sola página en lugar de 4 componentes  
✅ **Mejor UX**: Gestionar notificaciones desde el detalle del cableoperador  
✅ **Reutilizable**: FileUploadWithDrive se puede usar en otros lados  
✅ **Mantenible**: Todo en un solo archivo de cambios relacionados  
✅ **Eficiente**: Usa endpoints existentes en cableoperadoresService  

---

## 📞 Resumen Rápido

**Archivo principal**: [src/pages/CableOperadores/Detail.jsx](src/pages/CableOperadores/Detail.jsx)  
**Componente upload**: [src/components/UI/FileUploadWithDrive.jsx](src/components/UI/FileUploadWithDrive.jsx)  
**Servicio**: [src/services/cableoperadoresService.js](src/services/cableoperadoresService.js)  
**Endpoints**: `getNotificaciones()` y `postNotificaciones()`
