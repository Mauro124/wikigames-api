export interface GameResult {
  id?: string;
  challengeId: string;
  userId: string; // Changed from deviceId
  clicks: number;
  timeSeconds: number;
  path: string[];
  timestamp: any;
}
