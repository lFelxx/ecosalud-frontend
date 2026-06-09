import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

export class CancelAppointmentUseCase {
  private readonly repo: IAppointmentRepository;

  constructor(repo: IAppointmentRepository) {
    this.repo = repo;
  }

  async execute(id: number): Promise<Appointment> {
    return this.repo.cancel(id);
  }
}
