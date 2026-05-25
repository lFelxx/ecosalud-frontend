import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

export class GetAppointmentsUseCase {
  private readonly appointmentRepository: IAppointmentRepository;

  constructor(appointmentRepository: IAppointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.getByPatient(patientId);
  }
}
