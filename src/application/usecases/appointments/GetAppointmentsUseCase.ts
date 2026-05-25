import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

export class GetAppointmentsUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.getByPatient(patientId);
  }
}
