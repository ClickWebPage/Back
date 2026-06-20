# 🚀 DESPLIEGUE EN VPS - 2 CPUs, 1.5 GB RAM

## ✅ **VIABILIDAD DEL PROYECTO**

**Respuesta: SÍ, es posible** con optimizaciones apropiadas.

### **📊 Análisis de Recursos Requeridos**

#### **Consumo Base Estimado:**
- **Sistema Operativo (Ubuntu):** ~200-300 MB
- **Node.js + NestJS:** ~100-200 MB
- **Prisma ORM:** ~50-100 MB
- **Sharp (procesamiento imágenes):** ~50-150 MB (picos temporales)
- **PM2 (gestor procesos):** ~20-50 MB
- **Nginx (proxy reverso):** ~10-30 MB
- **Buffer del sistema:** ~100-200 MB

**Total estimado:** 530-1030 MB (en uso normal)

#### **✅ Margen disponible:** 500-970 MB para tu aplicación

---

## 🔧 **CONFIGURACIONES NECESARIAS**

### **1. Optimización de Node.js**

```bash
# Variables de entorno para optimizar memoria
NODE_OPTIONS="--max-old-space-size=512"
NODE_ENV=production
```

### **2. Configuración PM2 Optimizada**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'backend-chpc',
    script: 'dist/main.js',
    instances: 1, // Solo 1 instancia para conservar memoria
    exec_mode: 'fork', // Usar fork en lugar de cluster
    max_memory_restart: '400M', // Reiniciar si excede 400MB
    node_args: '--max-old-space-size=512',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
```

### **3. Optimización de Prisma**

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Optimizaciones para VPS de memoria limitada
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Método para limpiar conexiones periódicamente
  async cleanupConnections() {
    await this.$disconnect();
    await this.$connect();
  }
}
```

### **4. Configuración Nginx Optimizada**

```nginx
# /etc/nginx/sites-available/backend-chpc
server {
    listen 80;
    server_name tu-dominio.com;

    # Optimizaciones para memoria limitada
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts optimizados
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

---

## 📦 **SCRIPT DE DESPLIEGUE COMPLETO**

### **1. Preparación del Servidor**

```bash
#!/bin/bash
# deploy-vps.sh

echo "🚀 Iniciando despliegue en VPS..."

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Crear usuario para la aplicación
sudo useradd -m -s /bin/bash chpc-app
sudo usermod -aG sudo chpc-app

# Crear directorios
sudo mkdir -p /var/www/backend-chpc
sudo chown chpc-app:chpc-app /var/www/backend-chpc

echo "✅ Servidor preparado"
```

### **2. Despliegue de la Aplicación**

```bash
#!/bin/bash
# deploy-app.sh

# Cambiar al directorio de la aplicación
cd /var/www/backend-chpc

# Clonar repositorio
git clone https://github.com/MrSchwartz01/backend-chpc.git .

# Instalar dependencias (solo producción)
npm ci --only=production

# Construir aplicación
npm run build

# Configurar variables de entorno
cat > .env << EOF
# Base de datos (usar servicio externo como Prisma Postgres)
DATABASE_URL="tu-connection-string"

# JWT
JWT_SECRET="tu-jwt-secret"
JWT_REFRESH_SECRET="tu-refresh-secret"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password"

# Optimizaciones
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=512"
EOF

# Ejecutar migraciones
npx prisma migrate deploy

# Generar Prisma Client
npx prisma generate

# Configurar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Aplicación desplegada"
```

### **3. Monitoreo de Recursos**

```bash
# monitoring.sh
#!/bin/bash

# Script para monitorear recursos del VPS
echo "📊 MONITOREO DEL VPS"
echo "==================="

# Memoria
echo "💾 USO DE MEMORIA:"
free -h

# CPU
echo -e "\n🖥️ USO DE CPU:"
top -bn1 | grep "Cpu(s)"

# Procesos PM2
echo -e "\n🔄 PROCESOS PM2:"
pm2 status

# Espacio en disco
echo -e "\n💽 ESPACIO EN DISCO:"
df -h

# Logs de la aplicación
echo -e "\n📝 ÚLTIMOS LOGS:"
pm2 logs backend-chpc --lines 5
```

---

## ⚡ **OPTIMIZACIONES ADICIONALES**

### **1. Optimizar Sharp para Imágenes**

```typescript
// src/images/image-optimization.service.ts
import sharp from 'sharp';

// Configurar Sharp para usar menos memoria
sharp.cache(false); // Desactivar cache para usar menos memoria
sharp.concurrency(1); // Procesar una imagen a la vez

// En el método convertToWebp, usar configuración conservadora
const imageBuffer = await sharp(file.buffer, {
  limitInputPixels: 268402689, // Limitar píxeles de entrada
})
.resize(800, 800, { // Reducir tamaño máximo para conservar memoria
  fit: 'inside',
  withoutEnlargement: true,
})
.webp({
  quality: 80, // Reducir calidad para menor uso de memoria
  effort: 2,   // Menos esfuerzo de compresión
})
.toBuffer();
```

### **2. Configurar Swap**

```bash
# Crear archivo swap de 1GB para emergencias
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Ajustar swappiness (usar swap solo cuando sea necesario)
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### **3. Configurar Logrotate**

```bash
# /etc/logrotate.d/backend-chpc
/var/www/backend-chpc/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 chpc-app chpc-app
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🚨 **LIMITACIONES Y CONSIDERACIONES**

### **❌ Lo que NO puedes hacer:**
- Múltiples instancias de la aplicación (cluster mode)
- Procesamiento intensivo de imágenes muy grandes
- Cache en memoria extensivo
- Múltiples aplicaciones Node.js simultáneas

### **✅ Lo que SÍ puedes hacer:**
- Una instancia de la aplicación funcionando eficientemente
- Procesamiento de imágenes de tamaño moderado
- Todas las funcionalidades actuales del proyecto
- Base de datos externa (recomendado)

### **📊 Métricas de Rendimiento Esperadas:**
- **Tiempo de respuesta:** 100-500ms
- **Requests simultáneos:** 20-50
- **Uptime:** 99%+ con PM2
- **Procesamiento de imágenes:** 2-5 segundos por imagen

---

## 🔧 **COMANDOS DE MANTENIMIENTO**

```bash
# Reiniciar aplicación
pm2 restart backend-chpc

# Ver logs en tiempo real
pm2 logs backend-chpc --follow

# Monitorear memoria
pm2 monit

# Limpiar logs
pm2 flush

# Actualizar aplicación
cd /var/www/backend-chpc
git pull
npm run build
pm2 restart backend-chpc
```

---

## ✅ **CONCLUSIÓN**

**SÍ, tu proyecto puede funcionar perfectamente en un VPS de 1.5 GB RAM** siguiendo estas optimizaciones:

1. **Configuración conservadora de memoria**
2. **Una sola instancia de la aplicación**  
3. **Base de datos externa**
4. **Optimizaciones de Sharp y Prisma**
5. **Monitoreo continuo de recursos**

**Costo estimado VPS:** $5-15/mes dependiendo del proveedor.

**Rendimiento esperado:** Muy bueno para una aplicación de e-commerce pequeña a mediana.