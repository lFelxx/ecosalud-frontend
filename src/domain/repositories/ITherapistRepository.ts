import type { Therapist } from '../entities/Therapist';

export interface ITherapistRepository {
  getAvailable(): Promise<Therapist[]>;
}
