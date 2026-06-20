# Dockerfile para Backend NestJS - CHPC
# Optimizado para Dokploy con Docker Standalone (NO Swarm)

# --- Etapa de build ---
FROM node:20-alpine AS builder

# Declarar argumentos de construcción
ARG DATABASE_URL
ARG CORS_ORIGIN
ARG FRONTEND_URL
ARG UPLOAD_DIR
ARG GIT_SHA

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Copiar directorio de seeds EXPLICITAMENTE (antes de COPY . .)
COPY seeds ./seeds/

# Copiar scripts de mantenimiento
COPY fix-image-paths.js ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Usar DATABASE_URL del build arg si está disponible, sino usar valor por defecto
ARG DATABASE_URL=postgres://postgres:Humbug0809@chpc-web_database:5432/webpage?sslmode=disable
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# --- Etapa de producción ---
FROM node:20-alpine AS production

WORKDIR /app

# Copiar dependencias y build desde etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Copiar directorio completo de seeds
COPY --from=builder /app/seeds ./seeds
RUN chmod +x seeds/run-seeds.sh

# Generar cliente Prisma en producción
ARG DATABASE_URL=postgres://postgres:Humbug0809@chpc-web_database:5432/webpage?sslmode=disable
ARG CORS_ORIGIN=http://localhost:3000
ARG FRONTEND_URL=http://localhost:3000
ARG UPLOAD_DIR=/app/uploads
ARG GIT_SHA=unknown
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# Exponer puerto
EXPOSE 5000

# Establecer variables de entorno
ENV NODE_ENV=production
ENV PORT=5000
ENV CORS_ORIGIN=$CORS_ORIGIN
ENV FRONTEND_URL=$FRONTEND_URL
ENV UPLOAD_DIR=$UPLOAD_DIR
ENV GIT_SHA=$GIT_SHA

# Health check DESHABILITADO temporalmente para debug
# HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
#     CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Comando de inicio - ejecutar migraciones y luego iniciar la app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]