/**
 * appointmentApi.ts
 * Capa de acceso al backend para citas y servicios.
 * Usa axiosClient (ya lleva JWT en el header Authorization)
 * y añade X-Tenant-Slug para la selección de tenant.
 */
import axiosClient from '../../infrastructure/http/axiosClient';

const TENANT_SLUG =
  (import.meta.env.VITE_TENANT_SLUG as string | undefined) ?? 'dra-angelica-camacho';

const tenantHeaders = { 'X-Tenant-Slug': TENANT_SLUG };

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface BackendService {
  id: number;
  name: string;
  category: string;
  description: string;
  durationMinutes: number;
  priceCop: number;
  imageUrl?: string;
  active: boolean;
}

export interface BackendAppointment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  serviceId: number;
  serviceName: string;
  specialistId?: number;
  appointmentDate: string;   // yyyy-MM-dd
  appointmentTime: string;   // HH:mm:ss
  status: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  notes?: string;
  cancellationReason?: string;
  createdAt?: string;
}

export interface BookRequest {
  serviceId: number;
  appointmentDate: string;  // yyyy-MM-dd
  appointmentTime: string;  // HH:mm
  specialistId?: number;
  notes?: string;
}

// ── Funciones ─────────────────────────────────────────────────────────────────

/**
 * GET /api/services — público, sin auth.
 * Retorna [] si hay error de red o el backend no está disponible.
 */
export async function fetchBackendServices(): Promise<BackendService[]> {
  try {
    const res = await axiosClient.get<BackendService[]>('/services', {
      headers: tenantHeaders,
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/**
 * POST /api/appointments/book — requiere JWT del paciente.
 * El backend fuerza patientId desde el token (no se puede falsificar).
 * Lanza error si el servidor responde con error HTTP.
 */
export async function bookAppointment(req: BookRequest): Promise<BackendAppointment> {
  const res = await axiosClient.post<BackendAppointment>('/appointments/book', req, {
    headers: tenantHeaders,
  });
  return res.data;
}

/**
 * GET /api/appointments — el paciente solo recibe sus propias citas.
 * Retorna [] si hay error de red o el usuario no está autenticado.
 */
export async function getMyAppointments(): Promise<BackendAppointment[]> {
  try {
    const res = await axiosClient.get<BackendAppointment[]>('/appointments', {
      headers: tenantHeaders,
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}
