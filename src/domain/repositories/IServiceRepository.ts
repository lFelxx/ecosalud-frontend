import type { Service } from '../entities/Service';

export interface IServiceRepository {
  getAll(): Promise<Service[]>;
  getById(id: number): Promise<Service>;
}
