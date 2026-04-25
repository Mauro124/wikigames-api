import { generateChallengeUseCase } from '@features/challenges/domain/generate-challenge.usecase';
import { challengesRepository } from '@features/challenges/data/firestore-challenges.repository';
import { objectivesRepository } from '@features/challenges/data/firestore-objectives.repository';
import { wikipediaFeedService } from '@features/challenges/data/wikipedia-feed.service';
import { STARTERS } from '@features/challenges/domain/starters';

jest.mock('@features/challenges/data/firestore-challenges.repository');
jest.mock('@features/challenges/data/firestore-objectives.repository');
jest.mock('@features/challenges/data/wikipedia-feed.service');

describe('GenerateChallengeUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (challengesRepository.save as jest.Mock).mockResolvedValue(undefined);
    (objectivesRepository.findNextForLang as jest.Mock).mockResolvedValue({
      id: 'obj1',
      title: 'Target from Repo',
      lang: 'en'
    });
    (objectivesRepository.markAsUsed as jest.Mock).mockResolvedValue(undefined);
  });

  it('should generate challenges using objectives from repository', async () => {
    const lang = 'en';
    const expectedTarget = 'Target from Repo';

    // Mock BFS to find a path
    jest.spyOn(generateChallengeUseCase, 'findShortestPath').mockResolvedValue(3);

    const startDate = new Date('2026-04-20');
    const total = await generateChallengeUseCase.generateMonthlyBatch(startDate, lang);

    expect(total).toBeGreaterThan(0);
    
    expect(objectivesRepository.findNextForLang).toHaveBeenCalledWith(lang);
    expect(objectivesRepository.markAsUsed).toHaveBeenCalledWith('obj1', lang);

    expect(challengesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        targetTitle: expectedTarget,
        challenges: expect.arrayContaining([
          expect.objectContaining({ 
            endTitle: expectedTarget, 
            minClicks: 3 
          })
        ])
      })
    );
  });

  it('should skip generation if no objective is found in repository', async () => {
    const lang = 'en';
    (objectivesRepository.findNextForLang as jest.Mock).mockResolvedValue(null);

    const startDate = new Date('2026-04-20');
    const total = await generateChallengeUseCase.generateMonthlyBatch(startDate, lang);

    expect(total).toBe(0);
    expect(challengesRepository.save).not.toHaveBeenCalled();
  });
});
