-- Migración: Tabla de auditoría (historial de acciones del panel admin)
-- Ejecutar este script si la migración automática no pudo correr por problemas de conexión.

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id"               SERIAL PRIMARY KEY,
  "usuario_id"       INTEGER,
  "usuario_nombre"   TEXT NOT NULL,
  "usuario_username" TEXT NOT NULL,
  "usuario_rol"      TEXT NOT NULL,
  "accion"           TEXT NOT NULL,
  "modulo"           TEXT NOT NULL,
  "descripcion"      TEXT NOT NULL,
  "detalle"          JSONB,
  "ip_address"       TEXT,
  "user_agent"       TEXT,
  "exitoso"          BOOLEAN NOT NULL DEFAULT TRUE,
  "error_detalle"    TEXT,
  "fecha"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "audit_logs_usuario_id_idx"       ON "audit_logs"("usuario_id");
CREATE INDEX IF NOT EXISTS "audit_logs_modulo_idx"           ON "audit_logs"("modulo");
CREATE INDEX IF NOT EXISTS "audit_logs_accion_idx"           ON "audit_logs"("accion");
CREATE INDEX IF NOT EXISTS "audit_logs_fecha_idx"            ON "audit_logs"("fecha");
CREATE INDEX IF NOT EXISTS "audit_logs_usuario_username_idx" ON "audit_logs"("usuario_username");
