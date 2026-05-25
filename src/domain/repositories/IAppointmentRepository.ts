import type { Appointment } from '../entities/Appointment';

export interface IAppointmentRepository {
  getAll(): Promise<Appointment[]>;
  getById(id: number): Promise<Appointment>;
  getByPatient(patientId: number): Promise<Appointment[]>;
  create(data: Omit<Appointment, 'id'>): Promise<Appointment>;
  update(id: number, data: Partial<Appointment>): Promise<Appointment>;
  cancel(id: number): Promise<void>;
}
