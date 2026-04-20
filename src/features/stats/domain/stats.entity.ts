export interface DailyStats {
  id: string; // challengeId
  averageClicks: number;
  averageTime: number;
  totalWins: number;
  sumClicks: number;
  sumTime: number;
  distribution: Record<string, number>;
}
