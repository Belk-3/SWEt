import { describe, it, expect } from 'vitest';
import { checkAvailability, type Room } from './rooms';

const CURRENT = 540; // 09:00 fixed current time

/** Fresh fixture per test — never shared by reference */
function makeRoom(overrides?: Partial<Room>): Room {
  return {
    id: 'T',
    name: 'Test Room',
    building: 'Test',
    capacity: 10,
    blocked: false,
    bookings: [{ start: 600, end: 660, title: 'Existing' }],
    ...overrides,
  };
}

/** Deep clone bookings to detect any mutation */
function snapshotBookings(room: Room) {
  return JSON.parse(JSON.stringify(room.bookings)) as Room['bookings'];
}

/** Exact reason strings produced by checkAvailability (kept in sync with rooms.ts) */
const REASONS = {
  interval: 'Interval must satisfy 0 ≤ start < end ≤ 1440.',
  currentTime: 'Start time must be after the current time.',
  maxDuration: 'Booking cannot be longer than 120 minutes.',
  blocked: 'This room is currently blocked and cannot be booked.',
  overlap: (title: string, startLabel: string, endLabel: string) =>
    `Overlaps existing booking "${title}" (${startLabel}–${endLabel}).`,
} as const;

describe('checkAvailability — AC1–AC6 (currentMinutes = 540)', () => {
  // -------------------------------------------------------------------------
  // T01: touching after existing booking end — AC4
  // -------------------------------------------------------------------------
  it('T01: 660–720 touching after existing → available', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 660, 720, CURRENT);
    expect(res.available).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T02: start equals current time — AC1 (start must be *after* current)
  // -------------------------------------------------------------------------
  it('T02: 540–570 starts at current time → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 540, 570, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(REASONS.currentTime);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T03: zero-duration interval — AC1 (start < end required)
  // -------------------------------------------------------------------------
  it('T03: 720–720 zero duration → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 720, 720, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(REASONS.interval);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T04: reversed interval — AC1 (start < end required)
  // -------------------------------------------------------------------------
  it('T04: 750–720 reversed → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 750, 720, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(REASONS.interval);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T05: end past midnight — AC1 (end ≤ 1440 required)
  // -------------------------------------------------------------------------
  it('T05: 1380–1441 past day end → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 1380, 1441, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(REASONS.interval);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T06: exactly 120 minutes — AC2 (boundary: 120 is allowed)
  // -------------------------------------------------------------------------
  it('T06: 720–840 exactly 120 min → available', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 720, 840, CURRENT);
    expect(res.available).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T07: 121 minutes — AC2 (boundary: 121 is rejected)
  // -------------------------------------------------------------------------
  it('T07: 720–841 121 min → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 720, 841, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(REASONS.maxDuration);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T08: touching before existing booking start — AC4 (touching allowed)
  // -------------------------------------------------------------------------
  it('T08: 570–600 touching before → available', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 570, 600, CURRENT);
    expect(res.available).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T09: partial overlap — AC4
  // -------------------------------------------------------------------------
  it('T09: 630–690 partial overlap → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 630, 690, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(
      REASONS.overlap('Existing', '10:00', '11:00'),
    );
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T10: candidate contains booking — AC4
  // -------------------------------------------------------------------------
  it('T10: 570–690 contains booking → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 570, 690, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(
      REASONS.overlap('Existing', '10:00', '11:00'),
    );
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T11: candidate inside booking — AC4
  // -------------------------------------------------------------------------
  it('T11: 615–645 inside booking → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 615, 645, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(
      REASONS.overlap('Existing', '10:00', '11:00'),
    );
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T12: identical interval — AC4
  // -------------------------------------------------------------------------
  it('T12: 600–660 identical to booking → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 600, 660, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(
      REASONS.overlap('Existing', '10:00', '11:00'),
    );
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T13: blocked room — AC3
  // -------------------------------------------------------------------------
  it('T13: 660–720 blocked room → unavailable', () => {
    const room = makeRoom({ blocked: true });
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 660, 720, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(REASONS.blocked);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T14: no bookings, no overlap — AC4
  // -------------------------------------------------------------------------
  it('T14: 630–690 empty bookings → available', () => {
    const room = makeRoom({ bookings: [] });
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 630, 690, CURRENT);
    expect(res.available).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T15: data integrity — AC5 (check never mutates booking data)
  // -------------------------------------------------------------------------
  it('T15: bookings unchanged after check (AC5)', () => {
    const room = makeRoom();
    const before = snapshotBookings(room);
    checkAvailability(room, 630, 690, CURRENT);
    expect(room.bookings).toEqual(before);
    expect(room.bookings[0]).toEqual({
      start: 600,
      end: 660,
      title: 'Existing',
    });
  });

  // -------------------------------------------------------------------------
  // T16: ends exactly at midnight — AC1 (boundary: end = 1440 is allowed)
  // -------------------------------------------------------------------------
  it('T16: 1380–1440 ends at midnight → available', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 1380, 1440, CURRENT);
    expect(res.available).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T17: one minute after current, touching booking start — AC1/AC4
  // -------------------------------------------------------------------------
  it('T17: 541–600 one minute after now, touching booking → available', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 541, 600, CURRENT);
    expect(res.available).toBe(true);
    expect(res.reasons).toEqual([]);
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T18: two bookings, overlap only the second — AC4 (must check *any* booking)
  // -------------------------------------------------------------------------
  it('T18: 810–870 overlaps second of two bookings → unavailable', () => {
    const room = makeRoom({
      bookings: [
        { start: 600, end: 660, title: 'First' },
        { start: 780, end: 840, title: 'Second' },
      ],
    });
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, 810, 870, CURRENT);
    expect(res.available).toBe(false);
    expect(res.reasons).toContain(
      REASONS.overlap('Second', '13:00', '14:00'),
    );
    expect(room.bookings).toEqual(snap);
  });

  // -------------------------------------------------------------------------
  // T19: NaN start (cleared time field) — AC1/AC6 (invalid must never be available)
  // EXPECTED TO FAIL: implementation defect — checkAvailability does not
  // guard against NaN, so all comparisons silently pass and it returns
  // available=true. The test expectation is correct per AC1/AC6.
  // -------------------------------------------------------------------------
  it('T19: NaN start, end 720 (cleared time field) → unavailable', () => {
    const room = makeRoom();
    const snap = snapshotBookings(room);
    const res = checkAvailability(room, NaN, 720, CURRENT);
    expect(res.available).toBe(false);
    expect(room.bookings).toEqual(snap);
  });
});
