import type { Appointment, AppointmentRequest } from '../entities/Appointment';

export interface IAppointmentRepository {
  getByPatient(userId: number): Promise<Appointment[]>;
  book(data: AppointmentRequest): Promise<Appointment>;
  cancel(id: number): Promise<Appointment>;
  reschedule(id: number, newDate: string): Promise<Appointment>;
}
