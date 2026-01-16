# 🔧 Guía de Integración Backend Django

Esta guía te ayudará a configurar el backend Django para el sistema de notificaciones.

## 📋 Tabla de Contenidos

1. [Modelo](#modelo)
2. [Serializer](#serializer)
3. [ViewSet](#viewset)
4. [URLs](#urls)
5. [Permisos](#permisos)
6. [Ejemplo Completo](#ejemplo-completo)

---

## 📊 Modelo

Crea o actualiza el modelo en tu aplicación Django:

```python
# models.py
from django.db import models
from django.utils import timezone

class Notificacion(models.Model):
    TIPO_NOTIFICACION_CHOICES = [
        ('cobro_multa', 'Cobro de Multa'),
        ('suspension_nuevos_accesos', 'Suspensión de Nuevos Accesos'),
        ('cobro_prejuridico', 'Cobro Prejurídico'),
        ('incumplimiento_pago_factura', 'Incumplimiento de Pago de Factura'),
    ]
    
    cableoperador = models.ForeignKey(
        'Cableoperadores',
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    tipo_notificacion = models.CharField(
        max_length=100,
        choices=TIPO_NOTIFICACION_CHOICES,
        default='cobro_multa'
    )
    fecha = models.DateField()
    
    # JSONField para almacenar múltiples archivos
    # Estructura: [
    #   {
    #     "nombre": "documento.pdf",
    #     "url": "https://drive.google.com/file/d/.../view",
    #     "tipo": "application/pdf",
    #     "tamaño": 1024,
    #     "id": "file_id",
    #     "fechaSubida": "2025-01-16T10:30:00Z"
    #   }
    # ]
    ruta = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha', '-created_at']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        indexes = [
            models.Index(fields=['cableoperador', '-fecha']),
        ]
    
    def __str__(self):
        return f"Notificación de {self.cableoperador.nombre} - {self.fecha}"
    
    def get_total_archivos(self):
        """Retorna el número total de archivos"""
        return len(self.ruta) if isinstance(self.ruta, list) else 0
    
    def get_archivos_por_tipo(self):
        """Retorna un diccionario con cantidad de archivos por tipo"""
        if not isinstance(self.ruta, list):
            return {}
        
        tipos = {}
        for archivo in self.ruta:
            tipo = archivo.get('tipo', 'unknown')
            tipos[tipo] = tipos.get(tipo, 0) + 1
        return tipos
    
    def get_tamaño_total(self):
        """Retorna el tamaño total en bytes"""
        if not isinstance(self.ruta, list):
            return 0
        return sum(archivo.get('tamaño', 0) for archivo in self.ruta)
```

---

## 📝 Serializer

Crea el serializer en `serializers.py`:

```python
# serializers.py
from rest_framework import serializers
from .models import Notificacion, Cableoperadores

class ArchivoSerializer(serializers.Serializer):
    """Serializer para los archivos JSON"""
    nombre = serializers.CharField(max_length=255)
    url = serializers.URLField()
    tipo = serializers.CharField(max_length=100)
    tamaño = serializers.IntegerField()
    id = serializers.CharField(max_length=255)
    fechaSubida = serializers.DateTimeField()

class NotificacionSerializer(serializers.ModelSerializer):
    cableoperador_nombre = serializers.CharField(
        source='cableoperador.nombre',
        read_only=True
    )
    total_archivos = serializers.SerializerMethodField()
    tamaño_total = serializers.SerializerMethodField()
    archivos_por_tipo = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = [
            'id',
            'cableoperador',
            'cableoperador_nombre',
            'tipo_notificacion',
            'fecha',
            'ruta',
            'total_archivos',
            'tamaño_total',
            'archivos_por_tipo',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_archivos(self, obj):
        return obj.get_total_archivos()
    
    def get_tamaño_total(self, obj):
        return obj.get_tamaño_total()
    
    def get_archivos_por_tipo(self, obj):
        return obj.get_archivos_por_tipo()

class NotificacionListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listas"""
    cableoperador_nombre = serializers.CharField(
        source='cableoperador.nombre',
        read_only=True
    )
    total_archivos = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = [
            'id',
            'cableoperador',
            'cableoperador_nombre',
            'tipo_notificacion',
            'fecha',
            'total_archivos',
            'created_at',
        ]
    
    def get_total_archivos(self, obj):
        return obj.get_total_archivos()
```

---

## 👁️ ViewSet

Crea el viewset en `views.py`:

```python
# views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notificacion
from .serializers import NotificacionSerializer, NotificacionListSerializer

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['cableoperador', 'tipo_notificacion']
    search_fields = ['cableoperador__nombre', 'tipo_notificacion']
    ordering_fields = ['fecha', 'created_at']
    ordering = ['-fecha', '-created_at']
    pagination_class = None  # O tu clase de paginación personalizada
    
    def get_serializer_class(self):
        """Usa diferentes serializers para list vs detail"""
        if self.action == 'list':
            return NotificacionListSerializer
        return NotificacionSerializer
    
    def perform_create(self, serializer):
        """Hook para agregar lógica antes de crear"""
        instance = serializer.save()
        # Aquí puedes agregar lógica adicional
        # Ej: enviar email, webhook, etc.
    
    def perform_update(self, serializer):
        """Hook para agregar lógica antes de actualizar"""
        instance = serializer.save()
        # Aquí puedes agregar lógica adicional
    
    @action(detail=True, methods=['post'])
    def agregar_archivos(self, request, pk=None):
        """Endpoint para agregar más archivos a una notificación existente"""
        notificacion = self.get_object()
        nuevos_archivos = request.data.get('archivos', [])
        
        if not nuevos_archivos:
            return Response(
                {'error': 'No hay archivos para agregar'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar estructura de archivos
        for archivo in nuevos_archivos:
            required_fields = ['nombre', 'url', 'tipo', 'tamaño', 'id', 'fechaSubida']
            if not all(field in archivo for field in required_fields):
                return Response(
                    {'error': f'Archivo incompleto: faltan campos'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Agregar nuevos archivos a la lista existente
        ruta_actual = notificacion.ruta if isinstance(notificacion.ruta, list) else []
        notificacion.ruta = ruta_actual + nuevos_archivos
        notificacion.save()
        
        serializer = self.get_serializer(notificacion)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def remover_archivo(self, request, pk=None):
        """Endpoint para remover un archivo específico"""
        notificacion = self.get_object()
        archivo_id = request.data.get('archivo_id')
        
        if not archivo_id:
            return Response(
                {'error': 'archivo_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ruta_actual = notificacion.ruta if isinstance(notificacion.ruta, list) else []
        ruta_actualizada = [a for a in ruta_actual if a.get('id') != archivo_id]
        
        if len(ruta_actualizada) == len(ruta_actual):
            return Response(
                {'error': 'Archivo no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        notificacion.ruta = ruta_actualizada
        notificacion.save()
        
        serializer = self.get_serializer(notificacion)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def por_cableoperador(self, request):
        """Endpoint para obtener notificaciones de un cableoperador"""
        cableoperador_id = request.query_params.get('cableoperador_id')
        
        if not cableoperador_id:
            return Response(
                {'error': 'cableoperador_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notificaciones = self.queryset.filter(cableoperador_id=cableoperador_id)
        serializer = self.get_serializer(notificaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def estadisticas(self, request, pk=None):
        """Endpoint para obtener estadísticas de una notificación"""
        notificacion = self.get_object()
        
        return Response({
            'id': notificacion.id,
            'total_archivos': notificacion.get_total_archivos(),
            'tamaño_total': notificacion.get_tamaño_total(),
            'archivos_por_tipo': notificacion.get_archivos_por_tipo(),
        })
```

---

## 🛣️ URLs

Configura las rutas en `urls.py`:

```python
# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet

router = DefaultRouter()
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')

urlpatterns = [
    path('api/', include(router.urls)),
    # Tus otras URLs...
]

# O si usas un archivo urls.py separado por app:
# En tu app/urls.py:
urlpatterns = [
    path('', include(router.urls)),
]

# Y luego en tu proyecto/urls.py:
# path('api/', include('your_app.urls')),
```

---

## 🔐 Permisos

Crea un permission personalizado si es necesario:

```python
# permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permite editar solo al propietario del objeto
    """
    def has_object_permission(self, request, view, obj):
        # Lectura permitida a cualquier request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Escritura solo para el propietario
        return obj.cableoperador.user == request.user

# En viewset:
# permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
```

---

## 📦 Ejemplo Completo

Aquí está todo junto en un archivo:

```python
# models.py, serializers.py, views.py, urls.py

# ===== models.py =====
from django.db import models

class Notificacion(models.Model):
    TIPO_CHOICES = [
        ('cobro_multa', 'Cobro de Multa'),
        ('suspension_nuevos_accesos', 'Suspensión de Nuevos Accesos'),
        ('cobro_prejuridico', 'Cobro Prejurídico'),
        ('incumplimiento_pago_factura', 'Incumplimiento de Pago de Factura'),
    ]
    
    cableoperador = models.ForeignKey('Cableoperadores', on_delete=models.CASCADE)
    tipo_notificacion = models.CharField(max_length=100, choices=TIPO_CHOICES)
    fecha = models.DateField()
    ruta = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fecha', '-created_at']

# ===== serializers.py =====
from rest_framework import serializers

class NotificacionSerializer(serializers.ModelSerializer):
    cableoperador_nombre = serializers.CharField(source='cableoperador.nombre', read_only=True)
    
    class Meta:
        model = Notificacion
        fields = ['id', 'cableoperador', 'cableoperador_nombre', 'tipo_notificacion', 'fecha', 'ruta', 'created_at', 'updated_at']

# ===== views.py =====
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

# ===== urls.py =====
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'notificaciones', NotificacionViewSet)

urlpatterns = [path('api/', include(router.urls))]
```

---

## 🚀 Pasos de Instalación

1. **Crear migración:**
```bash
python manage.py makemigrations
```

2. **Ejecutar migración:**
```bash
python manage.py migrate
```

3. **Registrar en admin (opcional):**
```python
# admin.py
from django.contrib import admin
from .models import Notificacion

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['id', 'cableoperador', 'tipo_notificacion', 'fecha', 'created_at']
    list_filter = ['tipo_notificacion', 'fecha', 'created_at']
    search_fields = ['cableoperador__nombre']
    readonly_fields = ['created_at', 'updated_at']
```

4. **Pruebar en Postman o similar:**
```
GET    http://localhost:8000/api/notificaciones/
POST   http://localhost:8000/api/notificaciones/
GET    http://localhost:8000/api/notificaciones/1/
PUT    http://localhost:8000/api/notificaciones/1/
DELETE http://localhost:8000/api/notificaciones/1/
```

---

## 📨 Ejemplo de Petición POST

```json
{
  "cableoperador_id": 1,
  "tipo_notificacion": "cobro_multa",
  "fecha": "2025-01-16",
  "ruta": [
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

---

## 🔍 Filtros Disponibles

```
GET /api/notificaciones/?cableoperador=1
GET /api/notificaciones/?tipo_notificacion=cobro_multa
GET /api/notificaciones/?search=nombre_operador
GET /api/notificaciones/?ordering=-fecha
```

---

¡Listo para integrar con el frontend! 🎉
