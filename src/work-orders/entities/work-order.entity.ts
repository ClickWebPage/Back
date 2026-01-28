import { WorkOrderStatus } from '@prisma/client';

export class WorkOrder {
  id: number;
  trackingId: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  marca_equipo: string;
  modelo_equipo: string;
  numero_serie?: string;
  descripcion_problema: string;
  notas_tecnicas?: string;
  estado: WorkOrderStatus;
  costo_estimado?: number;
  costo_final?: number;
  tecnico_id?: number;
  tecnico_nombre?: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_entrega?: Date;
  userId?: number;
}
