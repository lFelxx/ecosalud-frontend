import type { IAppointmentRepository } from '../../../domain/repositories/IAppointmentRepository';
import type { Appointment, AppointmentRequest } from '../../../domain/entities/Appointment';

export class BookAppointmentUseCase {
  private readonly repo: IAppointmentRepository;

  constructor(repo: IAppointmentRepository) {
    this.repo = repo;
  }

  async execute(data: AppointmentRequest): Promise<Appointment> {
    return this.repo.book(data);
  }
}
