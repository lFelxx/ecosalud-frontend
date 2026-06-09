import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

export class GetPatientAppointmentsUseCase {
  private readonly repo: IAppointmentRepository;

  constructor(repo: IAppointmentRepository) {
    this.repo = repo;
  }

  async execute(userId: number): Promise<Appointment[]> {
    return this.repo.getByPatient(userId);
  }
}
