import { BaseFirestoreRepository } from '@shared/data/base-firestore.repository';
import { Category } from '../domain/category.entity';

export class FirestoreCategoriesRepository extends BaseFirestoreRepository<Category> {
  constructor() {
    super('categories');
  }
}

export const categoriesRepository = new FirestoreCategoriesRepository();
