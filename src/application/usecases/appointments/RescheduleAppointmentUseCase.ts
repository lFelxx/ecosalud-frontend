import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment } from '../../../domain/entities/Appointment';

export class RescheduleAppointmentUseCase {
  private readonly repo: IAppointmentRepository;

  constructor(repo: IAppointmentRepository) {
    this.repo = repo;
  }

  async execute(id: number, newDate: string): Promise<Appointment> {
    return this.repo.reschedule(id, newDate);
  }
}
