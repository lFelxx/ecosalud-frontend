import axiosClient from '../http/axiosClient';
import type { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../domain/entities/Appointment';

export class AppointmentRepository implements IAppointmentRepository {
  async getAll(): Promise<Appointment[]> {
    const { data } = await axiosClient.get<Appointment[]>('/appointments');
    return data;
  }

  async getById(id: number): Promise<Appointment> {
    const { data } = await axiosClient.get<Appointment>(`/appointments/${id}`);
    return data;
  }

  async getByPatient(patientId: number): Promise<Appointment[]> {
    const { data } = await axiosClient.get<Appointment[]>(`/appointments/patient/${patientId}`);
    return data;
  }

  async create(appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> {
    const { data } = await axiosClient.post<Appointment>('/appointments', appointmentData);
    return data;
  }

  async update(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    const { data } = await axiosClient.put<Appointment>(`/appointments/${id}`, appointmentData);
    return data;
  }

  async cancel(id: number): Promise<void> {
    await axiosClient.patch(`/appointments/${id}/cancel`);
  }
}
