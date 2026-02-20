# 🚀 Instrucciones de Configuración - AIR-E

## Requisitos Previos

- Node.js (v16 o superior)
- Python 3.x
- PostgreSQL (según configuración del backend)

## 1️⃣ Configurar el Backend (Django)

### Navegar al directorio del backend
```bash
cd c:\Air-e_api
```

### Instalar dependencias
```bash
# Si usas pipenv
pipenv install
pipenv shell

# O si usas pip
pip install -r requirements.txt
```

### Configurar variables de entorno
Verifica que el archivo `.env` tenga la configuración correcta de la base de datos:
```
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
```

### Ejecutar migraciones
```bash
python manage.py migrate
```

### Crear un superusuario (para acceder al admin y al sistema)
```bash
python manage.py createsuperuser
```
Sigue las instrucciones para crear tu usuario administrador.

### Iniciar el servidor Django
```bash
python manage.py runserver
```

El backend estará disponible en: `http://127.0.0.1:8000/`

## 2️⃣ Configurar el Frontend (React + Vite)

### Navegar al directorio del frontend
```bash
cd c:\Air-e
```

### Instalar dependencias
```bash
npm install
```

### Iniciar el servidor de desarrollo
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173/`

## 3️⃣ Acceder al Sistema

1. Abre tu navegador en `http://localhost:5173/`
2. Usa las credenciales del superusuario que creaste
3. ¡Listo! Ya puedes usar el sistema

## 📋 Endpoints Disponibles

### Backend API
- **Admin Django**: `http://127.0.0.1:8000/admin/`
- **API Root**: `http://127.0.0.1:8000/api/`
- **Login (JWT)**: `POST http://127.0.0.1:8000/api/token/`
- **Refresh Token**: `POST http://127.0.0.1:8000/api/token/refresh/`
- **User Profile**: `GET http://127.0.0.1:8000/api/auth/user/`
- **Cable-operadores**: `http://127.0.0.1:8000/api/cableoperadores/`
- **Contratos**: `http://127.0.0.1:8000/api/contratos/`

### Frontend
- **Login**: `http://localhost:5173/login`
- **Dashboard**: `http://localhost:5173/`
- **Cable-operadores**: `http://localhost:5173/cableoperadores`
- **Contratos**: `http://localhost:5173/contratos`

## 🔧 Solución de Problemas

### Error: "Connection refused" al hacer login
- Verifica que el backend Django esté corriendo en `http://127.0.0.1:8000/`
- Ejecuta: `python manage.py runserver`

### Error: "CORS policy"
- Ya está configurado `CORS_ALLOW_ALL_ORIGINS = True` en el backend
- Los puertos de Vite (5173) están agregados a `CSRF_TRUSTED_ORIGINS`

### Error: "Invalid credentials"
- Verifica que el usuario exista en la base de datos
- Crea un usuario con: `python manage.py createsuperuser`

### Error: "Database connection"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Ejecuta las migraciones: `python manage.py migrate`

### La sesión no persiste al recargar
- Verifica que localStorage esté habilitado en tu navegador
- Revisa la consola del navegador para ver errores

## 🎨 Características Implementadas

### Frontend
- ✅ Diseño moderno con Tailwind CSS
- ✅ Dark mode completo
- ✅ Sidebar colapsable
- ✅ Dashboard con estadísticas
- ✅ Gestión de Cableoperadores
- ✅ Gestión de Contratos
- ✅ Autenticación JWT
- ✅ Persistencia de sesión
- ✅ Responsive design

### Backend
- ✅ API REST con Django REST Framework
- ✅ Autenticación JWT con SimpleJWT
- ✅ CRUD completo de Cable-operadores
- ✅ CRUD completo de Contratos
- ✅ Panel de administración Django
- ✅ CORS configurado
- ✅ PostgreSQL como base de datos

## 📝 Notas Adicionales

### Crear usuarios adicionales
Puedes crear usuarios desde el admin de Django:
1. Ve a `http://127.0.0.1:8000/admin/`
2. Login con el superusuario
3. Ve a "Users" → "Add user"
4. Completa los datos y guarda

### Modo Mock (Desarrollo sin backend)
Si necesitas trabajar sin el backend, puedes activar el modo mock:
1. Edita `src/services/authService.js`
2. Cambia `const USE_MOCK = false` a `const USE_MOCK = true`
3. Ahora puedes hacer login con cualquier usuario/contraseña

### Estructura del Proyecto

```
aire/
├── Air-e/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── services/        # Servicios de API
│   │   ├── context/         # Contextos de React
│   │   └── utils/           # Utilidades
│   └── package.json
│
└── Air-e_api/               # Backend (Django)
    ├── API/                 # Configuración del proyecto
    ├── authentication/      # App de autenticación
    ├── cableoperadores/     # App de cableoperadores
    ├── contratos/          # App de contratos
    └── manage.py
```

## 🚀 Próximos Pasos

1. ✅ Sistema de autenticación (COMPLETADO)
2. ✅ CRUD de Cable-operadores (COMPLETADO)
3. ✅ CRUD de Contratos (COMPLETADO)
4. ⏳ Dashboard con estadísticas reales
5. ⏳ Reportes y exportación de datos
6. ⏳ Notificaciones de contratos próximos a vencer
7. ⏳ Búsqueda avanzada y filtros
8. ⏳ Historial de cambios y auditoría
