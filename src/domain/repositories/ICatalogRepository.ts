import type { CatalogItem } from '../entities/CatalogItem';

export interface ICatalogRepository {
  getAvailable(): Promise<CatalogItem[]>;
}
