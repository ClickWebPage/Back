#!/bin/bash
# 🚀 SCRIPT DE DESPLIEGUE AUTOMÁTICO PARA VPS
# Ejecutar como: bash deploy-to-vps.sh

set -e  # Detener en caso de error

echo "🚀 Iniciando despliegue automático en VPS..."
echo "============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${YELLOW}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para verificar si el comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# PASO 1: Preparar sistema
print_step "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema actualizado"

# PASO 2: Instalar Node.js
print_step "Instalando Node.js 18 LTS..."
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js instalado"
else
    print_success "Node.js ya está instalado"
fi

# PASO 3: Instalar PM2
print_step "Instalando PM2..."
if ! command_exists pm2; then
    sudo npm install -g pm2
    print_success "PM2 instalado"
else
    print_success "PM2 ya está instalado"
fi

# PASO 4: Instalar Nginx
print_step "Instalando Nginx..."
if ! command_exists nginx; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    print_success "Nginx instalado y habilitado"
else
    print_success "Nginx ya está instalado"
fi

# PASO 5: Crear usuario para la aplicación
print_step "Configurando usuario de aplicación..."
if ! id "chpc-app" &>/dev/null; then
    sudo useradd -m -s /bin/bash chpc-app
    print_success "Usuario chpc-app creado"
else
    print_success "Usuario chpc-app ya existe"
fi

# PASO 6: Crear directorio de aplicación
print_step "Creando directorio de aplicación..."
sudo mkdir -p /var/www/backend-chpc
sudo chown chpc-app:chpc-app /var/www/backend-chpc
print_success "Directorio creado"

# PASO 7: Cambiar a directorio de aplicación
print_step "Cambiando al directorio de aplicación..."
cd /var/www/backend-chpc

# PASO 8: Clonar repositorio o actualizar
print_step "Descargando código de la aplicación..."
if [ ! -d ".git" ]; then
    sudo -u chpc-app git clone https://github.com/MrSchwartz01/backend-chpc.git .
    print_success "Repositorio clonado"
else
    sudo -u chpc-app git pull
    print_success "Repositorio actualizado"
fi

# PASO 9: Configurar archivo de entorno
print_step "Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Base de datos (CAMBIAR POR TU CONNECTION STRING)
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# JWT Secrets (GENERAR NUEVOS SECRETS)
JWT_SECRET="tu-jwt-secret-super-seguro-de-32-caracteres-o-mas"
JWT_REFRESH_SECRET="tu-refresh-secret-super-seguro-de-32-caracteres-o-mas"

# Email Configuration (OPCIONAL)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"

# Production Settings
NODE_ENV=production
PORT=3000
NODE_OPTIONS="--max-old-space-size=512"

# CORS Origins (CAMBIAR POR TUS DOMINIOS)
CORS_ORIGIN="https://tu-frontend.com,http://localhost:3000"
EOF
    print_success "Archivo .env creado (RECUERDA CONFIGURAR LAS VARIABLES)"
else
    print_success "Archivo .env ya existe"
fi

# PASO 10: Crear configuración PM2
print_step "Creando configuración PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'backend-chpc',
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '400M',
    node_args: '--max-old-space-size=512',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
print_success "Configuración PM2 creada"

# PASO 11: Crear directorio de logs
print_step "Creando directorio de logs..."
mkdir -p logs
sudo chown -R chpc-app:chpc-app logs
print_success "Directorio de logs creado"

# PASO 12: Instalar dependencias
print_step "Instalando dependencias de Node.js..."
sudo -u chpc-app npm ci --only=production
print_success "Dependencias instaladas"

# PASO 13: Generar Prisma Client
print_step "Generando Prisma Client..."
sudo -u chpc-app npx prisma generate
print_success "Prisma Client generado"

# PASO 14: Construir aplicación
print_step "Construyendo aplicación..."
sudo -u chpc-app npm run build
print_success "Aplicación construida"

# PASO 15: Configurar Nginx
print_step "Configurando Nginx..."
cat > /etc/nginx/sites-available/backend-chpc << 'EOF'
server {
    listen 80;
    server_name _; # Cambiar por tu dominio

    # Límites de memoria optimizados
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
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss;

    # Logging
    access_log /var/log/nginx/backend-chpc.access.log;
    error_log /var/log/nginx/backend-chpc.error.log;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        root /var/www/backend-chpc/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_set_header Host $host;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/backend-chpc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
print_success "Nginx configurado"

# PASO 16: Configurar Swap
print_step "Configurando archivo swap..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    # Hacer permanente
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
    
    # Configurar swappiness
    if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
        echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
    fi
    
    print_success "Swap configurado (1GB)"
else
    print_success "Swap ya está configurado"
fi

# PASO 17: Configurar logrotate
print_step "Configurando rotación de logs..."
cat > /etc/logrotate.d/backend-chpc << 'EOF'
/var/www/backend-chpc/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 chpc-app chpc-app
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
EOF
print_success "Logrotate configurado"

# PASO 18: Iniciar aplicación con PM2
print_step "Iniciando aplicación con PM2..."
cd /var/www/backend-chpc
sudo -u chpc-app pm2 start ecosystem.config.js
sudo -u chpc-app pm2 save
sudo pm2 startup systemd -u chpc-app --hp /home/chpc-app
print_success "Aplicación iniciada con PM2"

# PASO 19: Crear script de monitoreo
print_step "Creando script de monitoreo..."
cat > /usr/local/bin/monitor-chpc << 'EOF'
#!/bin/bash
echo "📊 MONITOREO BACKEND-CHPC"
echo "========================="
echo "Fecha: $(date)"
echo ""

echo "💾 MEMORIA:"
free -h
echo ""

echo "🖥️ CPU:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU Usage: " 100 - $1 "%"}'
echo ""

echo "🔄 PM2 STATUS:"
sudo -u chpc-app pm2 status
echo ""

echo "💽 DISCO:"
df -h | grep -E "/$|/var"
echo ""

echo "🌐 NGINX STATUS:"
systemctl is-active nginx
echo ""

echo "📊 CONEXIONES ACTIVAS:"
netstat -an | grep :80 | wc -l
echo ""

echo "🔥 TOP PROCESOS POR MEMORIA:"
ps aux --sort=-%mem | head -5
EOF

chmod +x /usr/local/bin/monitor-chpc
print_success "Script de monitoreo creado (usar: monitor-chpc)"

# PASO 20: Crear script de deploy/update
print_step "Creando script de actualización..."
cat > /usr/local/bin/update-chpc << 'EOF'
#!/bin/bash
echo "🔄 Actualizando backend-chpc..."
cd /var/www/backend-chpc
sudo -u chpc-app git pull
sudo -u chpc-app npm ci --only=production
sudo -u chpc-app npm run build
sudo -u chpc-app npx prisma migrate deploy
sudo -u chpc-app pm2 restart backend-chpc
echo "✅ Actualización completada"
EOF

chmod +x /usr/local/bin/update-chpc
print_success "Script de actualización creado (usar: update-chpc)"

echo ""
echo "🎉 ¡DESPLIEGUE COMPLETADO!"
echo "========================="
print_success "Aplicación desplegada exitosamente"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Editar /var/www/backend-chpc/.env con tus configuraciones"
echo "2. Configurar tu base de datos PostgreSQL"
echo "3. Ejecutar: cd /var/www/backend-chpc && npx prisma migrate deploy"
echo "4. Reiniciar: pm2 restart backend-chpc"
echo "5. Configurar tu dominio en /etc/nginx/sites-available/backend-chpc"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "- monitor-chpc        : Ver estado del sistema"
echo "- update-chpc         : Actualizar aplicación"
echo "- pm2 logs backend-chpc : Ver logs"
echo "- pm2 restart backend-chpc : Reiniciar app"
echo ""
echo "🌐 Tu aplicación debería estar corriendo en:"
echo "http://$(curl -s ipecho.net/plain || echo 'tu-ip')"
echo ""
print_success "¡Listo para usar!"