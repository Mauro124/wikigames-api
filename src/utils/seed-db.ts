import { FirestoreChallengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { FirestoreObjectivesRepository } from '@features/challenges/data/firestore-objectives.repository';
import { logger } from '@shared/services/logger.service';
import { Objective } from '@features/challenges/domain/objective.entity';

async function seedObjectives() {
  const objectivesRepository = new FirestoreObjectivesRepository();

  const objectives_es = [
    'Lionel Messi',
    'Diego Maradona',
    'Boca Juniors',
    'River Plate',
    'Real Madrid',
    'FC Barcelona',
    'Selección de fútbol de Argentina',
    'Copa Mundial de Fútbol de 2022',
    'Estadio Azteca',
    'Libertadores',
    'Revolución Francesa',
    'Imperio Romano',
    'Antiguo Egipto',
    'Segunda Guerra Mundial',
    'Guerra Fría',
    'Cristóbal Colón',
    'Napoleón Bonaparte',
    'Julio César',
    'Alejandro Magno',
    'Leonardo da Vinci',
    'Torre Eiffel',
    'Gran Muralla China',
    'Machu Picchu',
    'Pirámides de Giza',
    'Coliseo de Roma',
    'Estatua de la Libertad',
    'Taj Mahal',
    'Chichén Itzá',
    'Cristo Redentor',
    'Petra',
    'Albert Einstein',
    'Isaac Newton',
    'Charles Darwin',
    'Marie Curie',
    'Stephen Hawking',
    'Nikola Tesla',
    'Galileo Galilei',
    'Mecánica cuántica',
    'ADN',
    'Sistema Solar',
    'The Beatles',
    'Michael Jackson',
    'Queen (banda)',
    'Elvis Presley',
    'Madonna',
    'Star Wars',
    'Harry Potter',
    'El Señor de los Anillos',
    'Marvel Comics',
    'The Simpsons',
    'Don Quijote de la Mancha',
    'Cien años de soledad',
    'La Gioconda',
    'Internet',
    'Bitcoin',
  ];

  const objectives_en = [
    'Lionel Messi',
    'Cristiano Ronaldo',
    'Manchester United',
    'Liverpool F.C.',
    'Real Madrid',
    'Super Bowl',
    'NBA',
    'Wimbledon',
    'Olympic Games',
    'FIFA World Cup',
    'French Revolution',
    'Roman Empire',
    'Ancient Egypt',
    'World War II',
    'Cold War',
    'Christopher Columbus',
    'Napoleon',
    'Julius Caesar',
    'Alexander the Great',
    'Leonardo da Vinci',
    'Eiffel Tower',
    'Great Wall of China',
    'Machu Picchu',
    'Pyramids of Giza',
    'Colosseum',
    'Statue of Liberty',
    'Taj Mahal',
    'Chichen Itza',
    'Christ the Redeemer',
    'Petra',
    'Albert Einstein',
    'Isaac Newton',
    'Charles Darwin',
    'Marie Curie',
    'Stephen Hawking',
    'Nikola Tesla',
    'Galileo Galilei',
    'Quantum mechanics',
    'DNA',
    'Solar System',
    'The Beatles',
    'Michael Jackson',
    'Queen (band)',
    'Elvis Presley',
    'Madonna',
    'Star Wars',
    'Harry Potter',
    'The Lord of the Rings',
    'Marvel Comics',
    'The Simpsons',
    'Don Quixote',
    'One Hundred Years of Solitude',
    'Mona Lisa',
    'Internet',
    'Bitcoin',
  ];

  logger.info('Seeding objectives...');

  for (const title of objectives_es) {
    await objectivesRepository.save({
      title,
      lang: 'es',
      usageCount: 0,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Objective);
  }

  for (const title of objectives_en) {
    await objectivesRepository.save({
      title,
      lang: 'en',
      usageCount: 0,
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Objective);
  }

  logger.info('Objectives seeded.');
}

async function seed() {
  const challengesRepository = new FirestoreChallengesRepository();
  await seedObjectives();
  const today = new Date().toISOString().split('T')[0];

  const initialChallenge = {
    id: today,
    lang: 'en',
    targetTitle: 'Philosophy',
    challenges: [
      {
        id: 1,
        startTitle: 'Earth',
        endTitle: 'Philosophy',
        minClicks: 3,
        difficulty: 'Easy' as const,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await challengesRepository.save(initialChallenge);
    logger.info(`Seeded initial challenge for ${today}`);
  } catch (error) {
    logger.error({ msg: 'Seeding failed', error });
  }
}

seed();
