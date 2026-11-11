export const MIN_PER_DAY = 1440;

export type Interval = readonly [number, number];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** The single minutes-to-text formatter used by rules and UI. */
export function minutesToHHMM(min: number): string {
  if (min === MIN_PER_DAY) return '24:00';
  const m = ((min % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
}

export function hhmmToMinutes(input: string): number | null {
  const match = input.trim().match(/^(\d{1,2}):([0-5]\d)$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  if (h > 24 || (h === 24 && mm !== 0)) return null;
  return h * 60 + mm;
}
