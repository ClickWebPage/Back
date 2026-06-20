# 🚨 SCRIPT PARA REMOVER ENDPOINTS DE TEST

## Cuando la funcionalidad esté completamente probada y funcionando en producción:

### 1. Remover endpoint de test del controlador:

```typescript
// QUITAR ESTOS MÉTODOS del archivo src/images/images.controller.ts:

/**
 * Endpoint de testing para subida de imágenes (SIN AUTENTICACIÓN)
 * Solo para debugging - REMOVER EN PRODUCCIÓN
 */
@Get('test-upload-info')
async testUploadInfo() { ... }

/**
 * Endpoint de testing para subida de imágenes (SIN AUTENTICACIÓN)
 * Solo para debugging - REMOVER EN PRODUCCIÓN
 */
@Post('test-upload/:productId')
@UseInterceptors(FileInterceptor('file'))
async testUploadImage() { ... }
```

### 2. Comando para ejecutar cuando esté todo funcionando:

```powershell
# Navegar al directorio del proyecto
cd "c:\Users\Contabilidad\Documents\GitHub\backend-chpc"

# Hacer backup del archivo actual
Copy-Item "src\images\images.controller.ts" "src\images\images.controller.backup.ts"

# Git commit antes de limpiar
git add .
git commit -m "Backup: Antes de limpiar endpoints de test"

# Remover endpoints de test (ejecutar comando de limpieza)
# Ver archivo: cleanup-test-endpoints.ps1
```

### 3. Archivos temporales a eliminar:

- `DEBUG_SUBIDA_IMAGENES.md`
- `test-image-upload.js` 
- `frontend-image-upload-complete.js` (después de implementar)
- `cleanup-test-endpoints.ps1` (este archivo)

### 4. Verificación final:

- ✅ Frontend funcionando con autenticación
- ✅ Subida de imágenes exitosa en producción
- ✅ No hay endpoints de test expuestos
- ✅ Logs de seguridad sin endpoints de debug

---

**IMPORTANTE:** Solo ejecutar después de confirmar que la funcionalidad está 100% operativa en el frontend de producción.