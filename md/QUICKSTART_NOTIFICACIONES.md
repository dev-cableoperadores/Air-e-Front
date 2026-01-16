# ⚡ Quick Start - Notificaciones en CableOperadores

## 🎯 Acceso Rápido

### Para crear una notificación:

1. **Navega a un Cableoperador**
   ```
   URL: http://localhost:3000/cableoperadores/[ID]
   ```

2. **Sección "Nueva Notificación"**
   ```
   ├─ Tipo: Selecciona (Cobro Multa, etc)
   ├─ Fecha: Selecciona fecha
   ├─ Archivos: Arrastra archivos aquí o click
   └─ Button: Click "Crear Notificación con Archivos"
   ```

3. **¡Listo!**
   ```
   ✅ Se suben archivos a Google Drive
   ✅ Se crea notificación en Django
   ✅ Aparece en "Historial de Notificaciones"
   ```

---

## 📁 Archivos Necesarios

```
✅ src/pages/CableOperadores/Detail.jsx
✅ src/components/UI/FileUploadWithDrive.jsx
✅ src/components/UI/FileUploadWithDrive.css
✅ src/services/cableoperadoresService.js (existente)
```

---

## 🔧 Configuración Necesaria

### .env.local
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Backend Django
```python
# Endpoints necesarios:
GET  /api/cableoperadores/{id}/notificaciones/
POST /api/cableoperadores/{id}/notificaciones/
```

---

## 🧪 Prueba Rápida

### 1. Navega a CableOperadores
```bash
http://localhost:3000/cableoperadores
```

### 2. Click en un cableoperador
```bash
Ej: http://localhost:3000/cableoperadores/5
```

### 3. Baja hasta "Nueva Notificación"
```
Llena el formulario con:
- Tipo: "Cobro de Multa"
- Fecha: Hoy
- Archivos: Cualquier imagen o PDF
```

### 4. Click "Crear Notificación con Archivos"
```
✅ Debe funcionar si están configurados los endpoints
```

---

## 📊 Estado

| Component | Status |
|-----------|--------|
| Upload | ✅ Funcional |
| Form | ✅ Funcional |
| Drive Integration | ⏳ Requiere Apps Script |
| Django API | ⏳ Debe estar ready |
| Visualización | ✅ Funcional |

---

## ⚠️ Problemas Comunes

### "Error: Archivo no seleccionado"
→ Selecciona al menos 1 archivo

### "Error: No se puede conectar a Drive"
→ Verifica `VITE_GOOGLE_APPS_SCRIPT_URL` en .env

### "Error 404 en API"
→ Verifica que los endpoints existan en Django

### "No hay notificaciones mostradas"
→ Verifica que `/api/cableoperadores/{id}/notificaciones/` retorna data

---

## 🚀 Próxima Iteración

¿Qué más necesitas?
- ¿Editar notificaciones?
- ¿Eliminar notificaciones?
- ¿Filtrar por tipo?
- ¿Exportar como PDF?

---

## 📚 Documentación Completa

Ver: `NOTIFICACIONES_EN_DETAIL.md`
