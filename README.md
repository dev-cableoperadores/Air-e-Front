# Air-e

## ✨ Resumen

Front-end construido con React + Vite + Tailwind CSS. Provee autenticación JWT, panel administrativo, CRUD para cable-operadores y contratos, y un dashboard con estadísticas.

## 🚀 Características principales

- Autenticación con JWT (access + refresh)
- CRUD de Cable-Operadores y Contratos
- Dashboard con métricas
- Diseño responsive y modo oscuro
- Integración opcional con Supabase

## 🛠 Tecnologías

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- @supabase/supabase-js (opcional)
- react-leaflet / leaflet (mapas)

## Requisitos

- Node.js 18.x (recomendado)
- npm
## Instalación (Frontend)
### Inspecciones — Detalle por archivo

- **Listado / Upload KMZ**
	- Archivo: `src/pages/Inspecciones/UploadKmz.jsx` (exporta `InspeccionesList`)  
	- Propósito: Mostrar proyectos KMZ pendientes de inspección en un mapa; permite subir KMZ (componente `KMZUpload`), ver estadísticas (`FeatureStats`) y previsualizar features en el mapa.  
	- Servicios/Utils: `fetchKmzImportsNoInspeccionados` desde `src/services/kmzService`, `convertDjangoToFeatures` (`kmlParser`), componentes `MapFeatures`, `MapChangeView`, `LocateControl`, `MonitorRealtime`. Archivo: [src/pages/Inspecciones/UploadKmz.jsx](src/pages/Inspecciones/UploadKmz.jsx)

- **Asignación de Proyectos**
	- Archivo: `src/pages/Inspecciones/AsignacionProyectos.jsx`  
	- Propósito: Panel para asignar proyectos (crear asignaciones a brigadas/inspectores), listar proyectos asignados, marcar como inspeccionado y exportar inventarios a Excel.  
	- Servicios/Utils: `asignacionService` (getAll, create, delete), `kmzService.fetchKmzImports`, `inspectoresService`, export helpers (`exportExcel.js`) y `handleMarcarInspeccionado`.  
	- Notas: interfaz responsive con vista de tabla en escritorio y cards en móvil; controles solo para `user.is_staff`. Archivo: [src/pages/Inspecciones/AsignacionProyectos.jsx](src/pages/Inspecciones/AsignacionProyectos.jsx)

- **Inventario (por proyecto)**
	- Archivo: `src/pages/Inspecciones/InventarioForm.jsx`  
	- Propósito: Registrar/editar inventario de postes para un proyecto; seleccionar coordenadas en el mapa, ver features del KMZ, subir fotos y navegar a registro de PRSTs.  
	- Servicios/Utils: `asignacionService.getById`, `inventarioService` (getByProyecto/create/update/delete), `inspectoresService`, `convertDjangoToFeatures`, `MapFeatures`, `PhotoUploader`.  
	- Notas: usa `MapClickHandler` para seleccionar coordenadas, muestra `MonitorRealtime` para staff y redirige a `PrstsForm` cuando se crea un inventario con PRSTs. Archivo: [src/pages/Inspecciones/InventarioForm.jsx](src/pages/Inspecciones/InventarioForm.jsx)

- **PRSTs (registro detallado por poste)**
	- Archivo: `src/pages/Inspecciones/PrstsForm.jsx`  
	- Propósito: Crear/editar PRSTs asociados a un `inventario`; admite modo "bucle" para registrar varios PRSTs de forma continua y subir fotos por PRST.  
	- Servicios/Utils: `prstsService` (create/update/delete/getByInventario), `inventarioService.getById`, `cableoperadoresService.getAllAllPages`, `PhotoUploader`.  
	- Notas: el parámetro `?modo=bucle&cantidad=...` activa un flujo guiado para registrar N PRSTs consecutivos. Archivo: [src/pages/Inspecciones/PrstsForm.jsx](src/pages/Inspecciones/PrstsForm.jsx)

- **Admin Dashboard (mapa realtime)**
	- Archivo: `src/pages/Inspecciones/AdminDashborad.jsx`  
	- Propósito: Vista de pantalla completa con `react-leaflet` que incorpora `MonitorRealtime` para mostrar actualizaciones en tiempo real (websockets/long-polling). Archivo: [src/pages/Inspecciones/AdminDashborad.jsx](src/pages/Inspecciones/AdminDashborad.jsx)

**Endpoints y notas operativas**

- Endpoints usados (ejemplos): `/api/inspectores/kmz-imports/`, `/api/inspectores/kmz-imports-noinspeccionados/`, `/api/proyectos/asignacion/`, `/api/proyectos/asignacion/:id/`, `/api/proyectos/inventario/`, `/api/prsts/` (y variantes `:id`).  
- Recomendación: documentar el contrato exacto de `kmz-imports` (qué campos devuelve `filename`, `features`, `id`) y el formato de `coordenada` en `inventario` (string `lat, lon`) para que clientes móviles y web sean consistentes.  
- Consejos: verificar permisos en endpoints de exportación y marcar `inspeccionado` desde el backend para evitar condiciones de carrera; el frontend espera que `handleMarcarInspeccionado(id)` confirme el cambio.  

1. Clona el repositorio y entra en la carpeta del proyecto:

```bash
git clone <repositorio>
cd Air-e
```

2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz y añade las variables necesarias (ver sección siguiente).

4. Inicia el servidor de desarrollo (documentado puerto: 3000):

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000` si `vite.config.js` mantiene `server.port = 3000`.

## Variables de entorno (frontend)

Ejemplo mínimo en `.env` (NO incluir secretos reales en el repositorio):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_ENVIRONMENT=development
# Autenticación
VITE_AUTH_SECRET=
VITE_AUTH_TOKEN_KEY=
# Supabase (si se utiliza)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Dónde se usan:

- `src/utils/api.js` — `VITE_API_BASE_URL`
- `src/lib/supabase.js` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Nota: nunca subir claves privadas ni `anon` keys sensibles al control de versiones.

## Scripts útiles

- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — build de producción
- `npm run preview` — previsualizar la build

## Backend (resumen)

El backend es un servicio aparte (Django). Para instrucciones completas y comandos de inicialización revisa [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

Comandos habituales del backend (ejemplo):

```bash
# instalar dependencias (pipenv o pip)
# pipenv install && pipenv shell
# o
# pip install -r requirements.txt

# ejecutar migraciones
python manage.py migrate

# crear superusuario
python manage.py createsuperuser

# arrancar servidor
python manage.py runserver
```

El frontend asume que el backend corre por defecto en `http://127.0.0.1:8000`.

## Despliegue (Vercel)

- Build command: `npm run build`
- Output directory: (por defecto Vite genera `dist`)
- Asegúrate de configurar en Vercel las variables de entorno arriba listadas (`VITE_API_BASE_URL`, `VITE_SUPABASE_*`, etc.).
- `vercel.json` incluye un rewrite para servir la SPA correctamente.

No publiques claves secretas en el repositorio; usa el panel de variables de entorno de Vercel.

## Estructura del proyecto (resumen)

- `src/lib/supabase.js` — cliente Supabase
- `src/utils/api.js` — configuración de Axios e `API_BASE_URL`
- `src/services/authService.js` — servicio de autenticación (modo mock/real)
- `src/context/AuthContext.jsx` — contexto de autenticación
- `src/pages/` — páginas principales (Login, Dashboard, CableOperadores, Contratos, ...)
- `src/components/` — componentes reutilizables y layouts
- `public/` — assets públicos

### CableOperadores — Detalle por archivo

- **Listado**  
	- Archivo: `src/pages/CableOperadores/List.jsx`  
	- Propósito: Mostrar tarjetas paginadas de los cableoperadores, búsqueda server-side, paginación y acciones rápidas (Ver, Editar, Nuevo).  
	- Servicios/Utils: usa `cableoperadoresService.getAllFull`, `formatters` y `Loading`.  
	- Notas: la búsqueda y paginación se resuelven en el backend (parámetros `search`, `desplazamiento`, `tamaño`).

- **Detalle**  
	- Archivo: `src/pages/CableOperadores/Detail.jsx`  
	- Propósito: Mostrar todos los campos de un cableoperador, historial de notificaciones y formulario para crear nuevas notificaciones. Incluye botones para editar, ver mapa de postes y ver facturas relacionadas.  
	- Servicios/Utils: `cableoperadoresService.getById`, `getNotificaciones`, `postNotificaciones`; `formatters` y `TIPO_CHOICES`.  
	- Endpoints: `/api/cableoperadores/detail/:id/`, `/api/cableoperadores/:id/notificaciones/`.

- **Crear**  
	- Archivo: `src/pages/CableOperadores/New.jsx`  
	- Propósito: Formulario para crear un nuevo cableoperador. Normaliza/convierte campos numéricos antes de enviar y asigna `ejecutiva_id` desde el contexto de usuario.  
	- Servicios: `cableoperadoresService.create` (`POST /api/cableoperadores/list/`).

- **Editar**  
	- Archivo: `src/pages/CableOperadores/Edit.jsx`  
	- Propósito: Formulario para editar un cableoperador existente. Carga datos con `getById`, normaliza relaciones y envía `PUT` de actualización.  
	- Servicios: `cableoperadoresService.update` (`PUT /api/cableoperadores/detail/:id/`).

- **Mapa de Postes**  
	- Archivo: `src/pages/CableOperadores/Postes.jsx`  
	- Propósito: Mostrar en un mapa (`react-leaflet`) los postes asociados a un cableoperador (o todos). Permite añadir marcadores manuales y navegar a edición de postes.  
	- Servicios: `postesService.getByCableoperador` / `postesService.getAll`, y `cableoperadoresService.getById`.

- **Editar Poste**  
	- Archivo: `src/pages/CableOperadores/PostesEdit.jsx`  
	- Propósito: Formulario para editar un poste con validaciones de coordenadas y campos técnicos (material, tipo, altura, proyecto, etc.).  
	- Servicios: `postesService.getById`, `postesService.update`, `cableoperadoresService.getAllAllPages`.

**Servicios y utilidades relevantes**

- `src/services/cableoperadoresService.js` — métodos clave: `getAllFull`, `getAllAllPages`, `getById`, `create`, `update`, `delete`, `getNotificaciones`, `postNotificaciones`. Nota: `getAllAllPages` implementa caché en `localStorage` (5 min).
- `src/services/postesService.js` — carga y actualiza postes; usado por la vista de mapas.
- `src/services/facturasService.js` — operaciones sobre facturas (enlazadas desde detalle).
- `src/utils/api.js` — cliente Axios (`import.meta.env.VITE_API_BASE_URL`).
- `src/utils/formatters.js` — `formatPhone`, `formatNumber`, `formatDate`.
- `src/utils/constants.js` — listas y opciones utilizadas por los formularios.

**Flujo típico**

1. `List.jsx` — buscar o navegar páginas.  
2. `Detail.jsx` — ver información completa, historial de notificaciones y acciones relacionadas.  
3. `New.jsx` / `Edit.jsx` — crear o editar registros.  
4. `Postes.jsx` / `PostesEdit.jsx` — ver o modificar postes en mapa.

**Notas de mantenimiento**

- Documentar que `cableoperadoresService.getAllFull` usa `desplazamiento` y `tamaño` para paginación.  
- Explicar la caché de 5 minutos en `getAllAllPages` y cómo borrarla con `cableoperadoresService.clearCache()`.  
- Recomendar reiniciar el dev server si se editan variables en `.env`.

---

### Utils — Descripción por archivo

Esta sección describe las utilidades reutilizables dentro de `src/utils` y cómo usarlas brevemente.

- `src/utils/api.js` — Cliente Axios centralizado.  
	- Propósito: crea una instancia de Axios con `baseURL` desde `import.meta.env.VITE_API_BASE_URL`, inyecta el token JWT desde `localStorage` y gestiona el refresh automático de `access_token` cuando recibe 401.  
	- Uso: `import api from 'src/utils/api'` y luego `api.get('/api/...')`.  
	- Nota: en caso de refresh fallido redirige a `/login` y muestra notificaciones con `react-hot-toast`.

- `src/utils/formatters.js` — Formateadores de fechas, números y teléfono.  
	- Funciones principales: `formatDate`, `formatDateForInput`, `formatCurrency`, `formatNumber`, `formatDecimal`, `formatPhone`, `formatMonthYear`, `convertMonthToDate`, `addOneMonth`, `convertDateToMonth`.  
	- Uso típico: `import { formatDate, formatPhone } from 'src/utils/formatters'` y usar en vistas para mostrar valores legibles.

- `src/utils/kmlParser.js` — Parseo y conversión de KML/KMZ para mapas.  
	- Propósito: convertir cadenas KML a un array de features (Point, LineString, Polygon), extraer estilos e íconos y convertir la estructura que devuelve el backend Django a features para el mapa.  
	- Funciones: `parseKML(kmlString)` y `convertDjangoToFeatures(djangoData)`.  
	- Ejemplo: `const features = parseKML(kmlContent)` — luego renderizar `features` en el mapa.

- `src/utils/constants.js` — Constantes y listas de opciones usadas por formularios y selects.  
	- Contiene: `ESTADOS_CABLEOPERADOR`, `ESTADOS_CONTRATO`, `PAISES`, `DEPARTAMENTOS_COLOMBIA`, `MUNICIPIOS_COLOMBIA`, `MATERIALES_POSTE`, `TIPO_POSTE`, `TIPO_COORDENADA`, `TIPO_ELEMENTO`, `TIPO_CHOICES`, `COLORS`, etc.  
	- Uso: `import { ESTADOS_CABLEOPERADOR } from 'src/utils/constants'` y pasar la lista a `Select` o mapeos.

- `src/utils/validators.js` — Validadores de formularios.  
	- Funciones: `validateEmail`, `validateRequired`, `validatePhone`, `validateNIT`, `validateDateRange`, `validatePositiveNumber`, `validateForm` (valida un conjunto de campos según una definición).  
	- Uso: validar inputs antes de enviar datos al backend o mostrar mensajes amigables.

**Recomendaciones**

- Documentar en el README que `api.js` lee `VITE_API_BASE_URL` y que cualquier cambio en `.env` requiere reiniciar el servidor de desarrollo.  
- Mantener `formatters` y `validators` libres de dependencias side-effect para facilitar testeo unitario.  
- Añadir ejemplos mínimos de `parseKML` en la documentación de `Inspecciones` si esa vista permite subir KMZ/KML.

---

### Services — Descripción por archivo

El directorio `src/services` contiene abstracciones para comunicar la aplicación con la API backend. A continuación se resumen los servicios más importantes, los endpoints que consumen y notas de uso.

- `src/services/authService.js`  
	- Propósito: login/refresh/verify de tokens JWT y helpers para leer/guardar/limpiar tokens en `localStorage`.  
	- Endpoints: `POST /api/token/`, `POST /api/token/refresh/`, `POST /api/token/verify/`, `GET /api/auth/user/`.  
	- Notas: soporta modo `USE_MOCK` para desarrollo local sin backend.

- `src/services/cableoperadoresService.js`  
	- Propósito: CRUD y operaciones relacionadas con cable-operadores (listado, notificaciones, cache local).  
	- Endpoints: `GET /api/cableoperadores/list/`, `GET /api/cableoperadores/detail/:id/`, `POST /api/cableoperadores/list/`, `PUT /api/cableoperadores/detail/:id/`, `DELETE /api/cableoperadores/detail/:id/`, `GET/POST /api/cableoperadores/:id/notificaciones/`.  
	- Notas: `getAllFull` devuelve la respuesta paginada (count, results) y `getAllAllPages` itera páginas y cachea en `localStorage` por 5 minutos.

- `src/services/contratosService.js`  
	- Propósito: listado y CRUD de contratos con normalización de parámetros y soporte para iterar todas las páginas.  
	- Endpoints: `GET /api/contratos/list/`, `GET /api/contratos/list/:id/` (o búsqueda por `id`), `POST /api/contratos/list/`, `PUT/POST (simulado) /api/contratos/list/:id/`, `DELETE (simulado) /api/contratos/list/:id/`.  
	- Notas: transforma `page` → `desplazamiento` y limpia parámetros para evitar valores inválidos.

- `src/services/facturasService.js`  
	- Propósito: listar facturas, operaciones CRUD y gestionar registros de pago.  
	- Endpoints: `GET /api/facturas/`, `GET/POST/PUT/DELETE /api/facturas/:id/`, y rutas para pagos: `/api/pagos/`, `/api/facturas/pagos/:id/`, `/api/facturas/pagos/`.

- `src/services/postesService.js`  
	- Propósito: obtener, crear, actualizar y eliminar postes; obtener postes por `cableoperador`.  
	- Endpoints: `GET /api/postes/`, `GET /api/postes/cableoperador/:id/`, `GET /api/postes/:id`, `POST /api/postes/`, `PUT /api/postes/:id`, `DELETE /api/postes/:id`.

- `src/services/proyectosService.js`  
	- Propósito: manejar ingresos de proyectos (uploads/KMZ), listados y CRUD de proyectos.  
	- Endpoints: `/api/proyectos/ingreso/`, `/api/proyectos/ingreso-no-vinculados/`, `/api/proyectos/list/`, `/api/proyectos/single/:id/`, `/api/proyectos/:id/` y variantes para crear/actualizar/eliminar.

- `src/services/kmzService.js`  
	- Propósito: subir datos KMZ/KML al backend, listar imports y marcar proyectos inspeccionados.  
	- Endpoints: `POST /api/inspectores/kmz-imports/`, `GET /api/inspectores/kmz-imports/`, `GET /api/inspectores/kmz-imports-novinculados/`, `GET /api/inspectores/kmz-imports-noinspeccionados/`, `PATCH /api/proyectos/asignacion/:id/` (marcar inspeccionado).

- `src/services/exportExcel.js`  
	- Propósito: exportar informes/inventarios a Excel (descarga de blobs).  
	- Endpoints: `/api/coordenadas/exportar-gps/:kmzId/`, `/api/coordenadas/exportar-inventario/:proyectoId`, `/api/coordenadas/exportar-inventario-hoy/:proyectoId`, `/api/coordenadas/exportar-inventario-hoy/`.

- `src/services/inspectoresService.js`  
	- Propósito: CRUD de inspectores y listar recursos relacionados con inspecciones.  
	- Endpoints: `GET /api/inspectores/`, `GET /api/inspectores/:id/`, `POST/PUT/DELETE /api/inspectores/`.

- `src/services/inventarioService.js`  
	- Propósito: gestionar inventario por proyecto (listar, crear, actualizar, eliminar).  
	- Endpoints: `/api/proyectos/inventario/`, `/api/proyectos/inventario/?search=...`, `/api/proyectos/inventario/:id/`.

- `src/services/asignacionService.js`  
	- Propósito: gestionar proyectos de asignación/inspección (listar, crear, actualizar, borrar).  
	- Endpoints: `/api/proyectos/asignacion/`, `/api/proyectos/asignacion/:id/`.

- `src/services/acuerdoService.js`  
	- Propósito: acuerdos de pago asociados a facturas.  
	- Endpoints: `/api/facturas/acuerdos/`, `/api/facturas/acuerdos/:id/`, filtro por factura: `/api/facturas/acuerdos/?facturacion=...`.

- `src/services/prstsService.js`  
	- Propósito: gestionar PRSTs (entidades relacionadas con inspecciones/inventario).  
	- Endpoints: `/api/proyectos/prsts-inspeccionados/` y recursos relacionados.

**Notas generales sobre services**

- Todos los services usan `src/utils/api.js` para realizar peticiones; por tanto comparten el manejo de tokens y el refresh automático.  
- Varios servicios implementan funciones que iteran páginas (`getAllAllPages`) y deben usarse con precaución en entornos de memoria limitada.  
- Recomendación: documentar en el README los endpoints esperados por cada service y mantener la lista sincronizada con el backend cuando se actualice la API.

---

### Contratos — Detalle por archivo

- **Listado**
	- Archivo: `src/pages/Contratos/List.jsx`  
	- Propósito: Mostrar tabla/paginación de contratos con búsqueda server-side y filtros por estado y `cableoperador`. Incluye navegación a detalle y edición.  
	- Servicios/Utils: `contratosService.getAllFull`, `cableoperadoresService.getAllAllPages`, `formatters` (moneda, fecha), `Loading`, `Select`.  
	- Notas: usa parámetros `page`, `search`, `estado_contrato`, `cableoperador` y renderiza botones de paginación. Archivo: [src/pages/Contratos/List.jsx](src/pages/Contratos/List.jsx)

- **Detalle**
	- Archivo: `src/pages/Contratos/Detail.jsx`  
	- Propósito: Mostrar ficha completa del contrato (campos principales, pólizas, secciones de uso como `nap`, `cable`, `caja_empalme`, `reserva`) y acciones (Editar, Eliminar).  
	- Servicios/Utils: `contratosService.getById`, `cableoperadoresService.getById`, `formatters` (fecha, moneda), `Loading`.  
	- Notas: carga detalles del `cableoperador` vinculado cuando existe y agrupa campos en secciones colapsables. Archivo: [src/pages/Contratos/Detail.jsx](src/pages/Contratos/Detail.jsx)

- **Crear (Nuevo)**
	- Archivo: `src/pages/Contratos/New.jsx`  
	- Propósito: Formulario completo para crear contratos; calcula `fin_vigencia` automáticamente a partir de `inicio_vigencia` + `duracion_anos`, normaliza campos numéricos anidados y envía `POST`.  
	- Servicios/Utils: `contratosService.create`, `cableoperadoresService.getAllAllPages`, `SearchableSelect`, `Input`, `Select`, validaciones front (fechas, campos requeridos).  
	- Notas: contiene lógica para determinar estado (`Vigente`/`Vencido`) y prevenir loops al actualizar `fin_vigencia`. Archivo: [src/pages/Contratos/New.jsx](src/pages/Contratos/New.jsx)

- **Editar**
	- Archivo: `src/pages/Contratos/Edit.jsx`  
	- Propósito: Carga contrato existente, precarga selects y campos anidados, permite editar y enviar `PUT` de actualización.  
	- Servicios/Utils: `contratosService.getById`, `contratosService.update`, `cableoperadoresService.getAllAllPages`, `formatters.formatDateForInput`, `Input`, `Select`.  
	- Notas: mantiene la misma normalización de campos numéricos y lógica de cálculo de fechas que el formulario de creación. Archivo: [src/pages/Contratos/Edit.jsx](src/pages/Contratos/Edit.jsx)

**Resumen operativo**

- Endpoints usados: `GET /api/contratos/list/`, `GET /api/contratos/:id/` (o `list/:id/` según backend), `POST /api/contratos/list/`, `PUT /api/contratos/:id/`, `DELETE /api/contratos/:id/`.  
- Recomendación: documentar en el backend los parámetros `page` → `desplazamiento` si existe mismatch, y normalizar el nombre del endpoint `detail/:id` vs `:id/` para consistencia con otros servicios.  
- Consejos: en formularios evitar loop infinito al calcular `fin_vigencia` y usar `formatDateForInput` para `input[type=date]`.  

---

### Facturas — Detalle por archivo

- **Listado**
	- Archivo: `src/pages/Facturas/List.jsx`  
	- Propósito: Mostrar lista y tabla paginada de facturas con búsqueda, filtros por `estado` y `vencimiento`, y navegación a ver/editar factura.  
	- Servicios/Utils: `facturasService.getAllFull`, `formatters` (fecha, numero, mes), `Loading`, `Select`, `Input`.  
	- Notas: usa `desplazamiento` y `tamaño` para paginación; renderiza estado y badge de vencimiento. Archivo: [src/pages/Facturas/List.jsx](src/pages/Facturas/List.jsx)

- **Detalle**
	- Archivo: `src/pages/Facturas/Detail.jsx`  
	- Propósito: Ficha completa de una factura con resumen de pagos, registros de pagos (crear/editar/eliminar), y gestión de acuerdos de pago.  
	- Servicios/Utils: `facturasService.getById`, `facturasService.createPago/updatePago/deletePago`, `acuerdoService`, `formatters` (mes/fecha), `Modal`, `Input`.  
	- Notas: incluye modales para pagos y acuerdos, y lógica robusta para parsear errores de la API y mostrar mensajes. Archivo: [src/pages/Facturas/Detail.jsx](src/pages/Facturas/Detail.jsx)

- **Crear (Nueva)**
	- Archivo: `src/pages/Facturas/New.jsx`  
	- Propósito: Formulario para crear facturas; calcula `Periodo_vencimiento` automáticamente (ej. `addOneMonth`) y convierte `Mes_uso` a fecha con `convertMonthToDate`.  
	- Servicios/Utils: `facturasService.create`, `cableoperadoresService.getAllAllPages`, `SearchableSelect`, `Input`, `formatters`.  
	- Notas: normaliza `Valor_iva_millones` a partir de `Valor_facturado_iva`. Archivo: [src/pages/Facturas/New.jsx](src/pages/Facturas/New.jsx)

- **Editar**
	- Archivo: `src/pages/Facturas/Edit.jsx`  
	- Propósito: Cargar factura existente, permitir edición y enviar `PUT` de actualización.  
	- Servicios/Utils: `facturasService.getById`, `facturasService.update`, `cableoperadoresService.getAllFull`, `formatters.formatDateForInput`, `Input`, `Select`.  
	- Notas: precarga selects y convierte campos de fecha/mes para inputs; mantiene cálculo de `Periodo_vencimiento`. Archivo: [src/pages/Facturas/Edit.jsx](src/pages/Facturas/Edit.jsx)

- **Por Cableoperador**
	- Archivo: `src/pages/Facturas/FacturasByCableoperador.jsx`  
	- Propósito: Listado y resúmenes (totales facturado, pagado, pendiente) filtrado por `cableoperador`. Incluye navegación rápida al detalle del cableoperador.  
	- Servicios/Utils: `facturasService.getAllFull`, `cableoperadoresService.getById`, `formatters`.  
	- Notas: implementa filtrado en cliente y métricas agregadas. Archivo: [src/pages/Facturas/FacturasByCableoperador.jsx](src/pages/Facturas/FacturasByCableoperador.jsx)

**Resumen operativo**

- Endpoints usados: `GET /api/facturas/` (list/paginado), `GET /api/facturas/:id/`, `POST /api/facturas/`, `PUT /api/facturas/:id/`, `DELETE /api/facturas/:id/`.  
- Pagos y acuerdos: `POST/PUT/DELETE /api/facturas/pagos/` y `/api/facturas/pagos/:id/`, además de `/api/facturas/acuerdos/` y sus variantes (o `acuerdoService` endpoints).  
- Recomendación: documentar en backend el formato de `Mes_uso` y `Periodo_vencimiento` (si se usan `YYYY-MM` vs `YYYY-MM-DD`) para evitar conversiones inconsistentes.  

### Context — `AuthContext` y uso

El directorio `src/context` contiene providers y hooks para compartir estado global. Actualmente el principal es `AuthContext`.

- `src/context/AuthContext.jsx`  
	- Propósito: gestionar la sesión del usuario y exponer una API conveniente a los componentes vía `useAuth()`.  
	- API expuesta por el context:  
		- `user` — objeto del perfil de usuario (o `null`).  
		- `loading` — boolean que indica si el context está inicializando.  
		- `isAuthenticated` — boolean.  
		- `login(username, password)` — función asíncrona que llama a `authService.login`, guarda tokens en `localStorage`, carga el perfil y devuelve `{ success, user }` o `{ success: false, error }`.  
		- `logout()` — limpia tokens y user desde `localStorage` y actualiza el estado.  
		- `checkAuth()` — función para revalidar sesión (llamada al montar el provider).  
	- Uso típico: envolver la app con `<AuthProvider>` en `main.jsx` y usar `const { user, login, logout, isAuthenticated } = useAuth()` desde componentes.
	- Notas: si el token es mock (`mock-token-...`) usa el usuario guardado en `localStorage` en modo desarrollo; en token real hace `authService.getProfile()`.

**Ejemplo mínimo**

```jsx
import { AuthProvider, useAuth } from './context/AuthContext'

// En el root
// <AuthProvider><App /></AuthProvider>

// En un componente
function LoginForm() {
	const { login } = useAuth()
	// llamar a login(username, password)
}
```

Archivos de configuración importantes:

- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `tsconfig.json`
- `vercel.json`

## Comprobación rápida

1. Instala dependencias: `npm install`
2. Crear `.env` con las variables mínimas
3. Ejecutar `npm run dev` y abrir `http://localhost:3000`

Si el servidor no arranca:

- Revisa la consola del terminal para errores (puerto en uso, variables faltantes)
- Confirma la versión de Node: `node -v` (usar 18.x)

## Troubleshooting (problemas comunes)

- Error CORS al conectar con el backend: verifica que el backend permita orígenes desde `http://localhost:3000` o ajusta `VITE_API_BASE_URL`.
- Login que no funciona: revisa que `VITE_API_BASE_URL` apunte al backend correcto y que las rutas `/api/token/` existan.
- Variables `import.meta.env` no reconocidas: reinicia el servidor de desarrollo tras crear/editar `.env`.

## Contribuir

1. Crea una rama feature: `git checkout -b feature/mi-cambio`
2. Haz commits claros y PR contra `main`.
3. Añade notas en este README si introduces nuevas variables de entorno o pasos de despliegue.

## Licencia y propiedad

Proyecto propiedad de AIR-E.

---
Si quieres, puedo también:
- Añadir una sección detallada de Supabase (provisión de tablas y reglas),
- O actualizar `package.json` para fijar una versión y campo `engines`.

**Components**

- **UI (primitivas)**
	- **Button.jsx**: Componente de botón reutilizable con variantes de estilo (primary, secondary) y soporte para `disabled`. Archivo: [src/components/UI/Button.jsx](src/components/UI/Button.jsx)
	- **Input.jsx**: Campo de texto controlado con soporte para errores y estilos accesibles. Archivo: [src/components/UI/Input.jsx](src/components/UI/Input.jsx)
	- **Loading.jsx**: Indicador de carga simple usado en vistas y botones. Archivo: [src/components/UI/Loading.jsx](src/components/UI/Loading.jsx)
	- **Modal.jsx**: Componente modal genérico para diálogos y formularios emergentes. Archivo: [src/components/UI/Modal.jsx](src/components/UI/Modal.jsx)
	- **Select.jsx**: Select estilizado para listas cortas. Archivo: [src/components/UI/Select.jsx](src/components/UI/Select.jsx)
	- **SearchableSelect.jsx**: Select con búsqueda/filtrado para listas largas. Archivo: [src/components/UI/SearchableSelect.jsx](src/components/UI/SearchableSelect.jsx)
	- **Textarea.jsx**: Área de texto con estilo y conteo/validación opcional. Archivo: [src/components/UI/Textarea.jsx](src/components/UI/Textarea.jsx)

- **Utilidades y helpers**
	- **PhotoUploader.jsx**: Subida de imágenes a Google Drive mediante Apps Script; expone `onUploadSuccess` con las URLs subidas y controla tamaño y cantidad máxima. Archivo: [src/components/PhotoUploader.jsx](src/components/PhotoUploader.jsx)
	- **ErrorBoundary.jsx**: Captura errores de render y muestra fallback UI. Archivo: [src/components/ErrorBoundary.jsx](src/components/ErrorBoundary.jsx)

- **Layout**
	- **Header.jsx**: Barra superior con navegación, buscador rápido y estado del usuario. Archivo: [src/components/Layout/Header.jsx](src/components/Layout/Header.jsx)
	- **Sidebar.jsx**: Navegación lateral con enlaces a secciones (Dashboard, CableOperadores, Proyectos, etc.). Archivo: [src/components/Layout/Sidebar.jsx](src/components/Layout/Sidebar.jsx)
	- **MainLayout.jsx**: Composición principal del layout que incluye `Header`, `Sidebar` y el contenedor de contenido. Archivo: [src/components/Layout/MainLayout.jsx](src/components/Layout/MainLayout.jsx)

- **Map-related components** (en `src/components/Maps`)
	- **CoordinatePicker.jsx**: Selector de coordenadas sobre el mapa para formularios. Archivo: [src/components/Maps/CoordinatePicker.jsx](src/components/Maps/CoordinatePicker.jsx)
	- **FeatureStats.jsx**: Panel con estadísticas calculadas a partir de features geoespaciales. Archivo: [src/components/Maps/FeatureStats.jsx](src/components/Maps/FeatureStats.jsx)
	- **KMZUpload.jsx**: Componente para subir KMZ/KML y previsualizar contenido antes de enviar al backend. Archivo: [src/components/Maps/KMZUpload.jsx](src/components/Maps/KMZUpload.jsx)
	- **LocateControl.jsx**: Control para centrar el mapa en la ubicación del usuario. Archivo: [src/components/Maps/LocateControl.jsx](src/components/Maps/LocateControl.jsx)
	- **LocationMarker.jsx**: Marcador reutilizable para coordenadas con popup/tooltip. Archivo: [src/components/Maps/LocationMarker.jsx](src/components/Maps/LocationMarker.jsx)
	- **MapChangeView.jsx**: Componente que sincroniza cambios de vista (centro/zoom) con la UI. Archivo: [src/components/Maps/MapChangeView.jsx](src/components/Maps/MapChangeView.jsx)
	- **MapFeatures.jsx**: Renderiza GeoJSON/KML como capas sobre `react-leaflet`. Archivo: [src/components/Maps/MapFeatures.jsx](src/components/Maps/MapFeatures.jsx)
	- **MonitorRealtime.jsx**: Componente para mostrar actualizaciones en tiempo real (websocket/long-polling) sobre el mapa. Archivo: [src/components/Maps/MonitorRealtime.jsx](src/components/Maps/MonitorRealtime.jsx)

Cada componente UI sigue el esquema de estilos con Tailwind y está pensado para ser composable. Para ejemplos de uso revisa las páginas en `src/pages/` (por ejemplo `src/pages/CableOperadores/List.jsx` usa `Button`, `Input` y `Loading`).
