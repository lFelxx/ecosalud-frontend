export interface Appointment {
  id: number;
  patientId: number;
  serviceId: number;
  therapistId?: number;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
}
