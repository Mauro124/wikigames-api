import { Request, Response, NextFunction } from 'express';
import { generateChallengeUseCase } from '../domain/generate-challenge.usecase';
import { createManualChallengeUseCase } from '../domain/create-manual-challenge.usecase';
import { categoriesRepository } from '../data/firestore-categories.repository';
import { logger } from '@shared/services/logger.service';

export class InternalChallengeController {
  async generateMonthlyBatch(req: Request, res: Response): Promise<void> {
    const { startDate, lang = 'en' } = req.body;
    const start = startDate ? new Date(startDate) : new Date();

    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD.' });
      return;
    }

    try {
      logger.info(`Starting monthly challenge generation from ${start.toISOString()} (Lang: ${lang})`);

      generateChallengeUseCase
        .generateMonthlyBatch(start, lang)
        .then((total) => logger.info(`Monthly generation complete for ${lang}. Total: ${total}`))
        .catch((err) => logger.error(`Monthly generation failed for ${lang}: ${err.message}`));

      res.status(202).json({
        message: 'Generation started in background.',
        startDate: start.toISOString().split('T')[0],
        lang,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const challenge = await createManualChallengeUseCase.execute(req.body);

      res.status(201).json({
        status: 'success',
        data: challenge,
      });
    } catch (error) {
      next(error);
    }
  }

  async migrateCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    const translationMap: Record<string, string> = {
      'Science': 'Ciencia', 'History': 'Historia', 'Geography': 'Geografía', 'Politics': 'Política',
      'Mathematics': 'Matemáticas', 'Law': 'Derecho', 'Philosophy': 'Filosofía', 'Space': 'Espacio',
      'Music': 'Música', 'Business': 'Negocios', 'Engineering': 'Ingeniería', 'Psychology': 'Psicología',
      'Biology': 'Biología', 'Physics': 'Física', 'Art': 'Arte', 'Sociology': 'Sociología',
      'Video games': 'Videojuegos', 'Movies': 'Cine', 'Chemistry': 'Química', 'Medicine': 'Medicina',
      'Literature': 'Literatura', 'Economics': 'Economía', 'Mythology': 'Mitología', 'Education': 'Educación',
      'Animals': 'Animales', 'Technology': 'Tecnología', 'Astronomy': 'Astronomía', 'Architecture': 'Arquitectura',
      'Sports': 'Deportes', 'Food': 'Gastronomía'
    };

    try {
      const categories = await categoriesRepository.findAll();
      let updated = 0;
      for (const cat of categories) {
        const es = translationMap[cat.name];
        if (es) {
          await categoriesRepository.save({ ...cat, localNames: { en: cat.name, es } });
          updated++;
        }
      }
      res.json({ message: `Migrated ${updated} categories.` });
    } catch (error) {
      next(error);
    }
  }
}

export const internalChallengeController = new InternalChallengeController();
