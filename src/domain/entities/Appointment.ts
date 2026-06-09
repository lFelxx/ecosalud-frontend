export interface AppointmentRequest {
  userId: number;
  therapistId: number;
  catalogId: number;
  date: string;
}

export interface Appointment {
  id: number;
  userId: number;
  therapistId: number;
  catalogId: number;
  date: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'REPROGRAMADA';
  userName?: string;
  therapistName?: string;
  catalogName?: string;
}
