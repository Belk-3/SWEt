import { describe, expect, it } from 'vitest';
import { canBook } from './canBook';
import type { Interval } from './time';

const EXISTING: Interval[] = [[600, 660]];

describe('canBook', () => {
  it('allows a valid future booking', () => {
    expect(canBook(660, 720, 540, false, EXISTING)).toEqual({ available: true, reasons: [] });
  });

  it('rejects a start time in the past', () => {
    const result = canBook(480, 540, 540, false, []);
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Start must be after the current time 09:00.');
  });

  it('rejects start equal to now', () => {
    const result = canBook(540, 600, 540, false, []);
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Start must be after the current time 09:00 (start equal to now is not allowed).');
  });

  it('rejects a start time before the current time', () => {
    const result = canBook(420, 480, 540, false, []);
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('Start must be after the current time 09:00.');
  });

  it('rejects start equal to end', () => {
    const result = canBook(720, 720, 540, false, []);
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('End must be after start.');
  });

  it('rejects end before start', () => {
    const result = canBook(780, 720, 540, false, []);
    expect(result.available).toBe(false);
    expect(result.reasons).toContain('End must be after start.');
  });

  it('rejects a 121 minute duration', () => {
    const result = canBook(780, 901, 540, false, []);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Maximum duration is 120 minutes — you selected 121.']);
  });

  it('allows a 120 minute duration', () => {
    expect(canBook(780, 900, 540, false, []).available).toBe(true);
  });

  it('rejects a blocked room', () => {
    const result = canBook(660, 720, 540, true, EXISTING);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Room is blocked (maintenance).']);
  });

  it('rejects a booking that overlaps an existing booking', () => {
    const result = canBook(630, 690, 540, false, EXISTING);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Overlaps booking 10:00–11:00.']);
  });

  it('rejects a booking that fully contains an existing booking', () => {
    const result = canBook(595, 665, 540, false, EXISTING);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Overlaps booking 10:00–11:00.']);
  });

  it('allows a booking that ends exactly when an existing booking starts', () => {
    expect(canBook(540, 600, 480, false, EXISTING).available).toBe(true);
  });

  it('allows a booking that starts exactly when an existing booking ends', () => {
    expect(canBook(660, 720, 540, false, EXISTING).available).toBe(true);
  });

  it('does not mutate the existing bookings fixture', () => {
    const fixture: Interval[] = [[600, 660]];
    const snapshot = JSON.stringify(fixture);
    canBook(630, 690, 540, false, fixture);
    canBook(660, 720, 540, false, fixture);
    expect(JSON.stringify(fixture)).toBe(snapshot);
    expect(fixture).toHaveLength(1);
  });

  it('rejects a negative start time', () => {
    expect(canBook(-30, 60, 0, false, []).reasons).toEqual(['Start must be between 00:00 and 24:00.']);
  });

  it('rejects a negative end time and reports the ordering failure too', () => {
    expect(canBook(60, -30, 0, false, []).reasons).toEqual([
      'End must be between 00:00 and 24:00.',
      'End must be after start.',
    ]);
  });

  it('rejects an end time after 24:00', () => {
    expect(canBook(1380, 1441, 0, false, []).reasons).toEqual(['End must be between 00:00 and 24:00.']);
  });

  it('rejects fractional start or end minutes', () => {
    expect(canBook(60.5, 120, 0, false, []).reasons).toEqual(['Start and end times must be whole minutes.']);
    expect(canBook(60, 120.5, 0, false, []).reasons).toEqual(['Start and end times must be whole minutes.']);
  });

  it('allows a booking that ends exactly at 24:00 and reports 24:00 in overlap messages', () => {
    expect(canBook(1380, 1440, 0, false, []).available).toBe(true);
    expect(canBook(1410, 1440, 0, false, [[1380, 1440]]).reasons).toEqual(['Overlaps booking 23:00–24:00.']);
  });

  it('reports multiple simultaneous failures in the documented order', () => {
    const result = canBook(600, 900, 700, true, [[650, 750]]);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual([
      'Start must be after the current time 11:40.',
      'Maximum duration is 120 minutes — you selected 300.',
      'Room is blocked (maintenance).',
      'Overlaps booking 10:50–12:30.',
    ]);
  });
});
