export const MIN_PER_DAY = 1440;

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function minutesToHHMM(min: number): string {
  const m = ((min % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)}`;
}

export function hhmmToMinutes(input: string): number | null {
  const raw = input.trim();
  if (raw === '') return null;
  const m = raw.match(/^(\d{1,2}):([0-5]\d)$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const total = h * 60 + mm;
  if (h === 24 && mm !== 0) return null;
  if (h > 24) return null;
  return total;
}

export type Interval = readonly [number, number];

export interface Booking {
  start: number;
  end: number;
  label: string;
}
