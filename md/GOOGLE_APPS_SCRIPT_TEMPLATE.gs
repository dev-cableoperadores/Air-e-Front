/**
 * Google Apps Script para manejar subida de archivos a Google Drive
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Ir a https://script.google.com/
 * 2. Crear un nuevo proyecto
 * 3. Copiar este código en el editor
 * 4. Ir a Deploy → New deployment
 * 5. Seleccionar "Web app"
 * 6. Execute as: Tu cuenta
 * 7. Who has access: Anyone
 * 8. Deploy
 * 9. Copiar el URL y guardar en VITE_GOOGLE_APPS_SCRIPT_URL
 */

// ID de la carpeta padre en Google Drive donde crear carpetas
// Reemplazar con tu ID de carpeta
const PARENT_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';

// Función principal que recibe las notificaciones
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Validar datos
    if (!payload.archivos || payload.archivos.length === 0) {
      return createResponse({
        success: false,
        error: 'No hay archivos para subir'
      });
    }
    
    // Obtener la carpeta padre
    const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
    
    // Crear nombre de carpeta
    const folderName = `Notificación-${payload.tipoNotificacion}-${payload.cableoperadorId}-${payload.fecha}`;
    
    // Crear carpeta
    const notificationFolder = parentFolder.createFolder(folderName);
    
    // Subir archivos
    const uploadedFiles = [];
    
    for (const archivo of payload.archivos) {
      try {
        // Decodificar base64
        const blob = Utilities.newBlob(
          Utilities.base64Decode(archivo.data),
          archivo.mimeType,
          archivo.nombre
        );
        
        // Subir archivo a la carpeta
        const file = notificationFolder.createFile(blob);
        
        // Obtener información del archivo
        uploadedFiles.push({
          nombre: file.getName(),
          id: file.getId(),
          url: file.getUrl(),
          tipo: file.getMimeType(),
          tamaño: file.getSize(),
          fechaSubida: new Date().toISOString(),
          compartido: false
        });
        
        // Hacer el archivo compartible (opcional)
        // file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
        
      } catch (fileError) {
        console.error('Error al subir archivo:', archivo.nombre, fileError);
        throw new Error(`Error al subir ${archivo.nombre}: ${fileError.message}`);
      }
    }
    
    // Retornar respuesta exitosa
    return createResponse({
      success: true,
      folderUrl: notificationFolder.getUrl(),
      folderId: notificationFolder.getId(),
      archivos: uploadedFiles,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en doPost:', error);
    return createResponse({
      success: false,
      error: error.message
    }, 500);
  }
}

// Función helper para crear respuesta JSON
function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Función para manejar OPTIONS (CORS)
function doOptions(e) {
  return createResponse({});
}

/**
 * ESTRUCTURA DE PETICIÓN:
 * 
 * POST a la URL del Apps Script con este JSON:
 * {
 *   "cableoperadorId": 1,
 *   "tipoNotificacion": "cobro_multa",
 *   "fecha": "2025-01-16",
 *   "archivos": [
 *     {
 *       "data": "base64_encoded_data",
 *       "nombre": "documento.pdf",
 *       "mimeType": "application/pdf"
 *     },
 *     {
 *       "data": "base64_encoded_data",
 *       "nombre": "foto.jpg",
 *       "mimeType": "image/jpeg"
 *     }
 *   ]
 * }
 */

/**
 * ESTRUCTURA DE RESPUESTA (exitosa):
 * 
 * {
 *   "success": true,
 *   "folderUrl": "https://drive.google.com/drive/folders/...",
 *   "folderId": "folder_id",
 *   "archivos": [
 *     {
 *       "nombre": "documento.pdf",
 *       "id": "file_id",
 *       "url": "https://drive.google.com/file/d/.../view",
 *       "tipo": "application/pdf",
 *       "tamaño": 1024,
 *       "fechaSubida": "2025-01-16T10:30:00Z",
 *       "compartido": false
 *     }
 *   ],
 *   "timestamp": "2025-01-16T10:30:00Z"
 * }
 */

/**
 * ESTRUCTURA DE RESPUESTA (error):
 * 
 * {
 *   "success": false,
 *   "error": "Descripción del error"
 * }
 */

// ===== CONFIGURACIÓN AVANZADA (Opcional) =====

/**
 * Función para hacer archivos compartibles
 * Descomenta en createFile() si deseas que todos puedan acceder
 */
function shareFile(fileId, permission = 'VIEW') {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
    return true;
  } catch (error) {
    console.error('Error al compartir archivo:', error);
    return false;
  }
}

/**
 * Función para crear una estructura de carpetas por cableoperador
 * Descomenta si quieres organizar por operador
 */
function createCableoperadorFolder(cableoperadorId, parentId = PARENT_FOLDER_ID) {
  try {
    const parentFolder = DriveApp.getFolderById(parentId);
    const cabeFolders = parentFolder.getFoldersByName(`Cableoperador-${cableoperadorId}`);
    
    let folder;
    if (cabeFolders.hasNext()) {
      folder = cabeFolders.next();
    } else {
      folder = parentFolder.createFolder(`Cableoperador-${cableoperadorId}`);
    }
    
    return folder;
  } catch (error) {
    console.error('Error al crear carpeta de cableoperador:', error);
    throw error;
  }
}

/**
 * Función para agregar permisos específicos a una carpeta
 */
function setFolderPermissions(folderId, email, permission = 'EDITOR') {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const permissionMap = {
      'VIEWER': DriveApp.Permission.VIEW,
      'COMMENTER': DriveApp.Permission.COMMENT,
      'EDITOR': DriveApp.Permission.EDIT
    };
    
    folder.addEditor(email);
    return true;
  } catch (error) {
    console.error('Error al establecer permisos:', error);
    return false;
  }
}

/**
 * Función para listar archivos en una carpeta (para validación)
 */
function listFolderFiles(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      fileList.push({
        nombre: file.getName(),
        id: file.getId(),
        tipo: file.getMimeType(),
        tamaño: file.getSize(),
        url: file.getUrl()
      });
    }
    
    return fileList;
  } catch (error) {
    console.error('Error al listar archivos:', error);
    return [];
  }
}

/**
 * Función para eliminar una carpeta y su contenido
 * ⚠️ CUIDADO: Esta acción no se puede deshacer
 */
function deleteNotificationFolder(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    folder.setTrashed(true);
    return true;
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    return false;
  }
}

// ===== FUNCIÓN DE PRUEBA =====

/**
 * Ejecutar esta función desde el editor para probar
 * Reemplazar valores de prueba según sea necesario
 */
function testUpload() {
  const testPayload = {
    cableoperadorId: 1,
    tipoNotificacion: 'cobro_multa',
    fecha: '2025-01-16',
    archivos: [
      {
        data: Utilities.base64Encode('Contenido de prueba'),
        nombre: 'prueba.txt',
        mimeType: 'text/plain'
      }
    ]
  };
  
  // Simular petición
  const result = doPost({
    postData: {
      contents: JSON.stringify(testPayload)
    }
  });
  
  console.log('Resultado:', result.getContent());
}
