import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { Category } from '../domain/category.entity';

export class FirestoreCategoriesRepository extends BaseFirestoreRepository<Category> {
  constructor() {
    super('categories');
  }

  async save(category: Category): Promise<void> {
    const { id, ...data } = category;
    await this.persist(id, data);
  }
}

export const categoriesRepository = new FirestoreCategoriesRepository();
