import { shareVisualizer } from '../../../../src/features/results/utils/share-visualizer';

describe('ShareVisualizer', () => {
  it('should format header correctly', () => {
    const header = shareVisualizer.formatHeader('2024-06-01_0', 5, 120);
    expect(header).toBe('WikiGame 2024-06-01 - 5 clicks ⏱️ 2:00');
  });

  it('should generate grid based on efficiency', () => {
    const gridEfficient = shareVisualizer.generateGrid(5, 10);
    expect(gridEfficient).toContain('🟩');
    expect(gridEfficient).not.toContain('🟨');

    const gridInefficient = shareVisualizer.generateGrid(20, 10);
    expect(gridInefficient).toContain('🟥');
  });

  it('should truncate paths longer than 25', () => {
    const grid = shareVisualizer.generateGrid(30, 10);
    const parts = grid.split(' ');
    expect(parts).toContain('...');
    expect(parts.length).toBeLessThan(30);
  });
});
