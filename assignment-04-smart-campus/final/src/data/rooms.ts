import type { Interval } from '@/rules/time';

export const EQUIPMENT = ['Projector', 'Whiteboard', 'TV screen', 'Microphone'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly Equipment[];
  readonly blocked: boolean;
  readonly bookings: readonly Interval[];
}

/** Fictional catalog. B-204 keeps the original prototype's data (30 seats, 10:00-11:00 booked). */
export const ROOMS: readonly Room[] = [
  { id: 'B-204', name: 'Lab', capacity: 30, equipment: ['Projector', 'Whiteboard'], blocked: false, bookings: [[600, 660]] },
  { id: 'A-101', name: 'Seminar Room', capacity: 12, equipment: ['Whiteboard', 'TV screen'], blocked: false, bookings: [[720, 780]] },
  { id: 'C-310', name: 'Lecture Hall', capacity: 80, equipment: ['Projector', 'Whiteboard', 'Microphone'], blocked: false, bookings: [[600, 720], [840, 900]] },
  { id: 'D-015', name: 'Study Pod', capacity: 4, equipment: ['Whiteboard'], blocked: false, bookings: [] },
  { id: 'E-120', name: 'Workshop', capacity: 25, equipment: ['Projector'], blocked: true, bookings: [] },
];
