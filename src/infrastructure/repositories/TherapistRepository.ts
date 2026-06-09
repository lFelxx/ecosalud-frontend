import axiosClient from '../http/axiosClient';
import type { ITherapistRepository } from '../../domain/repositories/ITherapistRepository';
import type { Therapist } from '../../domain/entities/Therapist';

export class TherapistRepository implements ITherapistRepository {
  async getAvailable(): Promise<Therapist[]> {
    const { data } = await axiosClient.get<Therapist[]>('/therapists/available');
    return data;
  }
}
