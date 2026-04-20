export class ShareVisualizer {
  /**
   * Generates the complete shareable text snippet.
   */
  generate(
    challengeId: string,
    clicks: number,
    timeSeconds: number,
    averageClicks: number,
  ): string {
    const header = this.formatHeader(challengeId, clicks, timeSeconds);
    const grid = this.generateGrid(clicks, averageClicks);
    return `${header}\n\n${grid}`;
  }

  /**
   * Formats the header line.
   */
  formatHeader(challengeId: string, clicks: number, timeSeconds: number): string {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = timeSeconds % 60;
    const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    // Extract date from ID (YYYY-MM-DD_N)
    const date = challengeId.split('_')[0];
    return `WikiGame ${date} - ${clicks} clicks ⏱️ ${timeFormatted}`;
  }

  /**
   * Generates the emoji grid representing the path.
   */
  generateGrid(pathLength: number, averageClicks: number): string {
    const START_END_EMOJI = '🔵';
    let pathEmoji = '🟩'; // Default efficient

    if (averageClicks > 0) {
      if (pathLength > averageClicks * 1.5) {
        pathEmoji = '🟥';
      } else if (pathLength > averageClicks) {
        pathEmoji = '🟨';
      }
    }

    // A path of N clicks has N+1 articles (Start + N clicks)
    // We represent the steps (clicks) between the start and end circles.
    // e.g., 2 clicks: 🔵 🟩 🟩 🔵

    let midSection = '';

    if (pathLength <= 25) {
        midSection = Array(pathLength).fill(pathEmoji).join(' ');
    } else {
        const startPart = Array(10).fill(pathEmoji).join(' ');
        const endPart = Array(10).fill(pathEmoji).join(' ');
        midSection = `${startPart} ... ${endPart}`;
    }
    return `${START_END_EMOJI} ${midSection} ${START_END_EMOJI}`;
  }
}

export const shareVisualizer = new ShareVisualizer();
