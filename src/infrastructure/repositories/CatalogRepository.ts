import axiosClient from '../http/axiosClient';
import type { ICatalogRepository } from '../../domain/repositories/ICatalogRepository';
import type { CatalogItem } from '../../domain/entities/CatalogItem';

export class CatalogRepository implements ICatalogRepository {
  async getAvailable(): Promise<CatalogItem[]> {
    const { data } = await axiosClient.get<CatalogItem[]>('/catalog/available');
    return data;
  }
}
