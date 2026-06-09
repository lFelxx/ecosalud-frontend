import type { ICatalogRepository } from '../../../domain/repositories/ICatalogRepository';
import type { CatalogItem } from '../../../domain/entities/CatalogItem';

export class GetAvailableCatalogUseCase {
  private readonly repo: ICatalogRepository;

  constructor(repo: ICatalogRepository) {
    this.repo = repo;
  }

  async execute(): Promise<CatalogItem[]> {
    return this.repo.getAvailable();
  }
}
