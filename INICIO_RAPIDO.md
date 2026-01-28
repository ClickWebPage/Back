# ⚡ INICIO RÁPIDO

## 🎯 Configuración en 3 Pasos

### 1. Configura la Base de Datos
```powershell
cd backend
.\setup-database.ps1
```

### 2. Inicia el Backend
```bash
npm run start:dev
```

### 3. Inicia el Frontend (en otra terminal)
```bash
cd ../
npm run serve
```

## 🌐 URLs Importantes

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:5000
- **Prisma Studio:** http://localhost:5555
- **API Productos:** http://localhost:5000/tienda/productos

## 📊 Productos Insertados

✅ **28 productos** distribuidos en **6 categorías**:
- 📱 Laptops (4)
- 🔧 Componentes (4)  
- ⌨️ Periféricos (4)
- 💾 Almacenamiento (4)
- 🌐 Redes (4)
- 🎧 Audio (4)

## 🔍 Prueba los Filtros

```bash
# Todos los productos
curl http://localhost:5000/tienda/productos

# Por categoría
curl "http://localhost:5000/tienda/productos?categoria=Laptops"

# Productos destacados
curl "http://localhost:5000/tienda/productos?destacado=true"

# Por rango de precio
curl "http://localhost:5000/tienda/productos?priceRange=low"

# Búsqueda
curl "http://localhost:5000/tienda/productos?search=gaming"
```

## 📖 Documentación Completa

Lee [RESUMEN_CAMBIOS.md](RESUMEN_CAMBIOS.md) para detalles completos.

## 🆘 Ayuda

Si algo no funciona:
1. Verifica que PostgreSQL esté corriendo
2. Revisa tu archivo `.env` 
3. Ejecuta `npm install` en backend
4. Consulta [SETUP_DATABASE.md](SETUP_DATABASE.md)

---

**¡Ya estás listo para desarrollar! 🚀**
