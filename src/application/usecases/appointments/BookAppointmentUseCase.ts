import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

export class BookAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(data: Omit<Appointment, 'id'>): Promise<Appointment> {
    if (!data.date || !data.time || !data.serviceId) {
      throw new Error('Fecha, hora y servicio son requeridos.');
    }
    return this.appointmentRepository.create(data);
  }
}
