import axiosClient from '../http/axiosClient';
import type { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import type { Appointment, AppointmentRequest } from '../../domain/entities/Appointment';

export class AppointmentRepository implements IAppointmentRepository {
  async getByPatient(userId: number): Promise<Appointment[]> {
    const { data } = await axiosClient.get<Appointment[]>(`/appointments/user/${userId}`);
    return data;
  }

  async book(request: AppointmentRequest): Promise<Appointment> {
    const { data } = await axiosClient.post<Appointment>('/appointments', request);
    return data;
  }

  async cancel(id: number): Promise<Appointment> {
    const { data } = await axiosClient.put<Appointment>(`/appointments/${id}/cancel`);
    return data;
  }

  async reschedule(id: number, newDate: string): Promise<Appointment> {
    const { data } = await axiosClient.put<Appointment>(`/appointments/${id}/reschedule`, { newDate });
    return data;
  }
}
