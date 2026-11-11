import type { Interval } from './time';

export interface CanBookResult {
  available: boolean;
  reasons: string[];
}

function pad(n: number): string {
  if (n === 1440) return '24:00';
  return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
}

function fmtRange(a: number, b: number): string {
  return `${pad(a)}–${pad(b)}`;
}

export function canBook(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Interval[]
): CanBookResult {
  const reasons: string[] = [];

  // AC1: integer bounds and ordering
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    reasons.push('Start and end times must be whole minutes.');
  }
  if (Number.isInteger(start) && (start < 0 || start > 1440)) {
    reasons.push('Start must be between 00:00 and 24:00.');
  }
  if (Number.isInteger(end) && (end < 0 || end > 1440)) {
    reasons.push('End must be between 00:00 and 24:00.');
  }
  if (Number.isInteger(start) && Number.isInteger(end) && start >= end) {
    reasons.push('End must be after start.');
  }
  if (
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    start <= 1440 &&
    end > start &&
    end <= 1440
  ) {
    // start must be strictly greater than now
    if (start <= now) {
      const nowStr = pad(now);
      if (start === now) {
        reasons.push(`Start must be after the current time ${nowStr} (start equal to now is not allowed).`);
      } else {
        reasons.push(`Start must be after the current time ${nowStr}.`);
      }
    }

    // AC2: duration
    const duration = end - start;
    if (duration > 120) {
      reasons.push(`Maximum duration is 120 minutes — you selected ${duration}.`);
    }
  }

  // AC3: blocked
  if (blocked) {
    reasons.push('Room is blocked (maintenance).');
  }

  // AC4: overlap
  if (Number.isInteger(start) && Number.isInteger(end) && end > start) {
    for (const [bStart, bEnd] of existing) {
      if (start < bEnd && bStart < end) {
        reasons.push(`Overlaps booking ${fmtRange(bStart, bEnd)}.`);
      }
    }
  }

  return { available: reasons.length === 0, reasons };
}
