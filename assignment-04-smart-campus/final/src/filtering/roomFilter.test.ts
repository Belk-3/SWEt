import { describe, expect, it } from 'vitest';
import { ROOMS, type Room } from '@/data/rooms';
import { filterRooms, matchesRequirements, parseAttendees } from '@/filtering/roomFilter';

const room: Room = { id: 'T-1', name: 'Test', capacity: 10, equipment: ['Projector', 'Whiteboard'], blocked: false, bookings: [] };

describe('catalog', () => {
  it('has at least four rooms with unique ids and all required fields', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ROOMS.map((r) => r.id)).size).toBe(ROOMS.length);
    for (const r of ROOMS) {
      expect(r.name).toBeTruthy();
      expect(r.capacity).toBeGreaterThan(0);
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.blocked).toBe('boolean');
      expect(Array.isArray(r.bookings)).toBe(true);
    }
  });
});

describe('F1 capacity filter', () => {
  it('boundary: exact capacity matches', () =>
    expect(matchesRequirements(room, { attendees: 10, equipment: [] })).toBe(true));
  it('boundary: one attendee over capacity does not match', () =>
    expect(matchesRequirements(room, { attendees: 11, equipment: [] })).toBe(false));
});

describe('F2 equipment filter', () => {
  it('matches when the room has all selected items', () =>
    expect(matchesRequirements(room, { attendees: 1, equipment: ['Projector', 'Whiteboard'] })).toBe(true));
  it('does not match when only some selected items are present', () =>
    expect(matchesRequirements(room, { attendees: 1, equipment: ['Projector', 'Microphone'] })).toBe(false));
  it('no selected equipment imposes no requirement', () =>
    expect(matchesRequirements(room, { attendees: 1, equipment: [] })).toBe(true));
});

describe('filterRooms and attendee parsing', () => {
  it('combines both filters over the catalog', () => {
    const ids = filterRooms(ROOMS, { attendees: 25, equipment: ['Projector', 'Microphone'] }).map((r) => r.id);
    expect(ids).toEqual(['C-310']);
  });
  it('returns an empty list when nothing matches and leaves the catalog unchanged', () => {
    const snapshot = JSON.stringify(ROOMS);
    expect(filterRooms(ROOMS, { attendees: 500, equipment: [] })).toEqual([]);
    expect(JSON.stringify(ROOMS)).toBe(snapshot);
  });
  it('parses attendee input', () => {
    expect(parseAttendees('')).toBe(0);
    expect(parseAttendees(' 12 ')).toBe(12);
    expect(parseAttendees('0')).toBeNull();
    expect(parseAttendees('-3')).toBeNull();
    expect(parseAttendees('2.5')).toBeNull();
    expect(parseAttendees('abc')).toBeNull();
  });
});
