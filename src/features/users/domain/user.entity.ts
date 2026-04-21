import { BaseEntity } from '@shared/domain/base.entity';

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  bestTimeSeconds: number | null;
  bestClicks: number | null;
  totalGames: number;
  totalScore: number;
  lastPlayedDate: string | null; // YYYY-MM-DD
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  avatarSvg: string;
  stats: UserStats;
}
