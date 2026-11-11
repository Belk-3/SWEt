import { describe, expect, it } from 'vitest';
import { canBook } from '@/rules/availability';

// Base data from the Assignment #03 brief.
const NOW = 540;
const EXISTING: [number, number][] = [[600, 660]];
const check = (start: number, end: number, blocked = false, existing = EXISTING, now = NOW) =>
  canBook(start, end, now, blocked, existing).available;

describe('AC1-AC5 regression', () => {
  it('AC1: rejects a start equal to now', () => expect(check(540, 570)).toBe(false));
  it('AC1: accepts a start one minute after now', () => expect(check(541, 570)).toBe(true));
  it('AC1: rejects a start before now', () => expect(check(500, 530)).toBe(false));
  it('AC1: rejects reversed and zero-length intervals', () => {
    expect(check(720, 700)).toBe(false);
    expect(check(720, 720)).toBe(false);
  });
  it('AC1: enforces day bounds (end 1440 ok, 1441 not, negative not)', () => {
    expect(check(1400, 1440)).toBe(true);
    expect(check(1400, 1441)).toBe(false);
    expect(check(-10, 30, false, [], -60)).toBe(false);
  });
  it('AC1: rejects non-integer minutes', () => expect(check(720.5, 750)).toBe(false));

  it('AC2 boundary: exactly 120 minutes is allowed', () => expect(check(720, 840)).toBe(true));
  it('AC2 boundary: 121 minutes is rejected', () => expect(check(720, 841)).toBe(false));

  it('AC3: a blocked room rejects an otherwise valid slot', () => expect(check(660, 720, true)).toBe(false));

  it('AC4 boundary: touching the end of a booking does not overlap', () => expect(check(660, 720)).toBe(true));
  it('AC4 boundary: touching the start of a booking does not overlap', () => expect(check(570, 600)).toBe(true));
  it('AC4: partial overlap is rejected', () => expect(check(630, 690)).toBe(false));
  it('AC4: containment is rejected', () => expect(check(610, 650)).toBe(false));
  it('AC4: checks every booking, not only the first', () => {
    const many: [number, number][] = [[600, 660], [780, 840]];
    expect(check(800, 820, false, many)).toBe(false);
  });

  it('AC5: returns an unambiguous result with reasons only on failure', () => {
    expect(canBook(660, 720, NOW, false, EXISTING)).toEqual({ available: true, reasons: [] });
    expect(canBook(630, 690, NOW, false, EXISTING).reasons).toEqual(['Overlaps booking 10:00–11:00.']);
  });
  it('AC5: does not mutate the existing bookings', () => {
    const existing: [number, number][] = [[600, 660], [780, 840]];
    const snapshot = JSON.stringify(existing);
    canBook(630, 690, NOW, true, existing);
    expect(JSON.stringify(existing)).toBe(snapshot);
  });
});
