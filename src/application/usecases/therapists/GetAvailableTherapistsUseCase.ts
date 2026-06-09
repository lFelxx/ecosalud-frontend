import type { ITherapistRepository } from '../../../domain/repositories/ITherapistRepository';
import type { Therapist } from '../../../domain/entities/Therapist';

export class GetAvailableTherapistsUseCase {
  private readonly repo: ITherapistRepository;

  constructor(repo: ITherapistRepository) {
    this.repo = repo;
  }

  async execute(): Promise<Therapist[]> {
    return this.repo.getAvailable();
  }
}
