import type { Equipment, Room } from '@/data/rooms';

export interface RoomRequirements {
  attendees: number;
  equipment: readonly Equipment[];
}

/** F1 and F2. Blocked rooms stay listed on purpose: F3 is enforced by the availability check. */
export function matchesRequirements(room: Room, { attendees, equipment }: RoomRequirements): boolean {
  return room.capacity >= attendees && equipment.every((item) => room.equipment.includes(item));
}

export function filterRooms(rooms: readonly Room[], requirements: RoomRequirements): Room[] {
  return rooms.filter((room) => matchesRequirements(room, requirements));
}

/** Empty means "no requirement" (0). Returns null for anything but a whole number >= 1. */
export function parseAttendees(input: string): number | null {
  const raw = input.trim();
  if (raw === '') return 0;
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return value >= 1 ? value : null;
}
