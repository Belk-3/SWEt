import { minutesToHHMM, type Interval } from './time';

export interface CanBookResult {
  available: boolean;
  reasons: string[];
}

const MAX_DURATION = 120;

/** AC1-AC4. Pure: never mutates `existing`. Rule meaning is unchanged from the original canBook. */
export function canBook(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Interval[]
): CanBookResult {
  const reasons: string[] = [];
  const wholeMinutes = Number.isInteger(start) && Number.isInteger(end);

  if (!wholeMinutes) {
    reasons.push('Start and end times must be whole minutes.');
  }
  if (Number.isInteger(start) && (start < 0 || start > 1440)) {
    reasons.push('Start must be between 00:00 and 24:00.');
  }
  if (Number.isInteger(end) && (end < 0 || end > 1440)) {
    reasons.push('End must be between 00:00 and 24:00.');
  }
  if (wholeMinutes && start >= end) {
    reasons.push('End must be after start.');
  }

  const ordered = wholeMinutes && end > start;

  if (ordered && start >= 0 && end <= 1440) {
    if (start <= now) {
      const nowText = minutesToHHMM(now);
      reasons.push(
        start === now
          ? `Start must be after the current time ${nowText} (start equal to now is not allowed).`
          : `Start must be after the current time ${nowText}.`
      );
    }
    const duration = end - start;
    if (duration > MAX_DURATION) {
      reasons.push(`Maximum duration is ${MAX_DURATION} minutes — you selected ${duration}.`);
    }
  }

  if (blocked) {
    reasons.push('Room is blocked (maintenance).');
  }

  if (ordered) {
    for (const [bookedStart, bookedEnd] of existing) {
      if (start < bookedEnd && bookedStart < end) {
        reasons.push(`Overlaps booking ${minutesToHHMM(bookedStart)}–${minutesToHHMM(bookedEnd)}.`);
      }
    }
  }

  return { available: reasons.length === 0, reasons };
}

export interface SlotInput {
  start: number | null;
  end: number | null;
  now: number | null;
  blocked: boolean;
  bookings: readonly Interval[];
}

/** Adds form-parsing feedback in front of canBook; the only place these messages exist. */
export function evaluateSlot({ start, end, now, blocked, bookings }: SlotInput): CanBookResult {
  if (start === null || end === null || now === null) {
    const reasons: string[] = [];
    if (start === null) reasons.push('Start time must be in HH:MM format.');
    if (end === null) reasons.push('End time must be in HH:MM format.');
    if (now === null) reasons.push('Simulated current time must be in HH:MM format.');
    return { available: false, reasons };
  }
  return canBook(start, end, now, blocked, bookings);
}
