import multiavatar from '@multiavatar/multiavatar';

/**
 * Generates a deterministic SVG avatar based on a unique seed (UID).
 * @param seed - The seed string (e.g., Firebase UID).
 * @returns The raw SVG string.
 */
export const generateAvatar = (seed: string): string => {
  return multiavatar(seed);
};
