# 📋 Sistema de Notificaciones con Google Drive

Este documento describe cómo usar el sistema de notificaciones integrado con Google Drive.

## 📁 Estructura de Archivos

```
src/
├── services/
│   └── notificacionesService.js          # Servicio CRUD con caché
├── pages/
│   └── Notificaciones/
│       ├── List.jsx                      # Listar notificaciones
│       ├── New.jsx                       # Crear nueva notificación
│       ├── Detail.jsx                    # Ver detalle
│       ├── Edit.jsx                      # Editar notificación
│       └── Notificaciones.css            # Estilos
└── components/
    └── UI/
        ├── FileUploadWithDrive.jsx       # Componente de upload
        └── FileUploadWithDrive.css       # Estilos del upload
```

## 🚀 Características

### 1. **Crear Notificación**
- Seleccionar cableoperador
- Elegir tipo de notificación
- Seleccionar fecha
- Subir múltiples archivos (imágenes o PDFs)
- Los archivos se suben automáticamente a Google Drive
- Se crea una carpeta por notificación

### 2. **Listar Notificaciones**
- Ver todas las notificaciones con paginación
- Filtrar por cableoperador o tipo
- Ver cantidad de archivos
- Acciones: Ver, Editar, Eliminar

### 3. **Ver Detalle**
- Ver todos los datos de la notificación
- Descargar archivos desde Google Drive
- Navegar a editar o eliminar

### 4. **Editar Notificación**
- Modificar tipo y fecha
- Agregar nuevos archivos
- Eliminar archivos existentes
- Mantener historial de archivos anteriores

## 📦 Modelo Django

```python
class Notificacion(models.Model):
    cableoperador = models.ForeignKey(Cableoperadores, on_delete=models.CASCADE)
    tipo_notificacion = models.CharField(max_length=100, choices=TIPO_NOTIFICACION, default='cobro_multa')
    fecha = models.DateField()
    # JSONField: [{"nombre": "...", "url": "...", "tipo": "...", "tamaño": ..., "id": "...", "fechaSubida": "..."}]
    ruta = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Google Apps Script

El sistema usa un Apps Script para manejar la subida a Google Drive. Necesitas:

1. Crear un Google Apps Script con permisos para Drive
2. Exponer como web app
3. Configurar el URL en `.env`

**Respuesta esperada del Apps Script:**

```json
{
  "success": true,
  "folderUrl": "https://drive.google.com/drive/folders/...",
  "archivos": [
    {
      "nombre": "documento.pdf",
      "url": "https://drive.google.com/file/d/.../view",
      "tipo": "application/pdf",
      "tamaño": 1024,
      "id": "file_id",
      "fechaSubida": "2025-01-16T10:30:00Z"
    }
  ]
}
```

## 💾 Servicio: notificacionesService

### Métodos disponibles

```javascript
// Obtener todas las notificaciones (con paginación)
await notificacionesService.getAllFull({ page: 1 })

// Obtener array de resultados
await notificacionesService.getAll({ page: 1 })

// Obtener todas las páginas (con caché)
await notificacionesService.getAllAllPages()

// Obtener por ID
await notificacionesService.getById(id)

// Obtener por cableoperador
await notificacionesService.getByCableoperador(cableoperadorId, { page: 1 })

// Crear notificación
await notificacionesService.create({
  cableoperador_id: 1,
  tipo_notificacion: 'cobro_multa',
  fecha: '2025-01-16',
  ruta: [{ nombre: "...", url: "...", ... }]
})

// Actualizar notificación
await notificacionesService.update(id, { ... })

// Eliminar notificación
await notificacionesService.delete(id)

// Limpiar caché manualmente
notificacionesService.clearCache()
```

## 🎨 Componente: FileUploadWithDrive

Componente reutilizable para subir archivos.

### Uso

```jsx
import FileUploadWithDrive from '../../components/UI/FileUploadWithDrive'

<FileUploadWithDrive
  onFilesSelect={(archivos) => console.log(archivos)}
  acceptedTypes="image/*,application/pdf"
/>
```

### Props

- `onFilesSelect` (function): Callback cuando cambian los archivos seleccionados
- `acceptedTypes` (string): Tipos MIME aceptados (default: "image/*,application/pdf")
- `maxFiles` (number): Máximo de archivos permitidos (default: null)

### Estructura de archivo

```javascript
{
  file: File,                    // Objeto File original
  base64: "data:image/png;...",  // Codificación base64
  nombre: "archivo.jpg",         // Nombre del archivo
  tipo: "image/jpeg",            // Tipo MIME
  tamaño: 1024,                  // Tamaño en bytes
  id: "archivo.jpg-1234567890"   // ID temporal único
}
```

## 📊 Caché

El servicio implementa caché en localStorage:

- **Clave**: `notificaciones_list_cache`
- **Expiración**: 5 minutos
- **Se limpia automáticamente** al crear, actualizar o eliminar

### Opciones de caché

```javascript
// Usar caché existente
const data = await notificacionesService.getAllAllPages()

// Forzar recarga (limpia caché primero)
notificacionesService.clearCache()
const data = await notificacionesService.getAllAllPages()
```

## 🔑 Tipos de Notificación

```javascript
const TIPO_NOTIFICACION_CHOICES = [
  { value: 'cobro_multa', label: 'Cobro de Multa' },
  { value: 'suspension_nuevos_accesos', label: 'Suspensión de Nuevos Accesos' },
  { value: 'cobro_prejuridico', label: 'Cobro Prejurídico' },
  { value: 'incumplimiento_pago_factura', label: 'Incumplimiento de Pago de Factura' },
]
```

## 🛣️ Rutas Disponibles

```
GET    /notificaciones           → Lista
GET    /notificaciones/new       → Crear (formulario)
POST   /notificaciones           → Crear (API)
GET    /notificaciones/:id       → Detalle
GET    /notificaciones/:id/edit  → Editar (formulario)
PUT    /notificaciones/:id       → Actualizar (API)
DELETE /notificaciones/:id       → Eliminar (API)
```

## 🎯 Flujo de Creación

1. Usuario selecciona cableoperador, tipo y fecha
2. Selecciona archivos (drag & drop o click)
3. Los archivos se convierten a base64 en el navegador
4. Al enviar:
   - Se envían a Google Drive vía Apps Script
   - Se reciben URLs de Google Drive
   - Se guardan en Django con las URLs
5. Notificación creada exitosamente

## 🎯 Flujo de Edición

1. Se cargan los archivos existentes (solo lectura)
2. Se pueden agregar nuevos archivos
3. Se pueden eliminar archivos existentes
4. Al actualizar:
   - Nuevos archivos se suben a Drive
   - Archivos eliminados se remueven de la lista
   - Se actualiza Django con la nueva lista

## 🐛 Manejo de Errores

Todos los componentes incluyen manejo de errores:

- Validación de campos requeridos
- Validación de archivos
- Mensajes de error/éxito
- Auto-limpieza de formularios

## 📱 Responsive

Todos los componentes son responsivos:
- Desktop: tabla con acciones
- Tablet: tabla comprimida
- Mobile: acciones apiladas

## 🔐 Seguridad

- Autenticación vía ProtectedRoute
- Validación en servidor (Django)
- Sanitización de nombres de archivo
- CORS configurado en Django

## 🚀 Integración con el Sidebar

Para agregar notificaciones al menú, editar `Sidebar.jsx`:

```jsx
<li>
  <Link to="/notificaciones">
    📋 Notificaciones
  </Link>
</li>
```

## 📝 Ejemplo de Uso Completo

```jsx
import { useState, useEffect } from 'react'
import notificacionesService from '../services/notificacionesService'

function MisNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    const cargar = async () => {
      const data = await notificacionesService.getAllFull({ page: 1 })
      setNotificaciones(data.results)
    }
    cargar()
  }, [])

  return (
    <div>
      {notificaciones.map(n => (
        <div key={n.id}>
          <h3>{n.tipo_notificacion}</h3>
          <p>Archivos: {n.ruta.length}</p>
        </div>
      ))}
    </div>
  )
}
```

## 📞 Soporte

Si encuentras problemas:

1. Verifica que el URL del Apps Script es correcto
2. Verifica que Django está ejecutándose en `http://localhost:8000`
3. Revisa la consola del navegador para errores
4. Revisa los logs de Django para errores de API
