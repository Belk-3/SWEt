import { useEffect, useMemo, useRef, useState } from 'react';
import { ROOMS, type Equipment } from '@/data/rooms';
import { filterRooms, parseAttendees } from '@/filtering/roomFilter';
import { canBook, evaluateSlot } from '@/rules/availability';
import { hhmmToMinutes, minutesToHHMM } from '@/rules/time';
import BookingForm from '@/ui/BookingForm';
import DayTimeline from '@/ui/DayTimeline';
import Header from '@/ui/Header';
import ResultPanel from '@/ui/ResultPanel';
import RoomFinder from '@/ui/RoomFinder';

const FALLBACK_NOW = 540;

const TODAY = new Date(2026, 9, 24).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

export default function App() {
  const [attendeesStr, setAttendeesStr] = useState('');
  const [equipment, setEquipment] = useState<readonly Equipment[]>([]);
  const [selectedId, setSelectedId] = useState(ROOMS[0].id);
  const [startStr, setStartStr] = useState('11:00');
  const [endStr, setEndStr] = useState('12:00');
  const [nowStr, setNowStr] = useState('09:00');
  const [simulatedBlocks, setSimulatedBlocks] = useState<Readonly<Record<string, boolean>>>({});
  const [dark, setDark] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const attendees = parseAttendees(attendeesStr);
  const rooms = useMemo(
    () => filterRooms(ROOMS, { attendees: attendees ?? 0, equipment }),
    [attendees, equipment]
  );

  // Derived, never stored: a filtered-out selection falls back to the first match (F5).
  const room = rooms.find((r) => r.id === selectedId) ?? rooms[0] ?? null;

  const startMin = hhmmToMinutes(startStr);
  const endMin = hhmmToMinutes(endStr);
  const nowMin = hhmmToMinutes(nowStr);
  const blocked = room !== null && (room.blocked || Boolean(simulatedBlocks[room.id]));
  const bookings = room?.bookings ?? [];

  // Derived during render, so the panel cannot show a stale result for another room.
  const result = evaluateSlot({ start: startMin, end: endMin, now: nowMin, blocked, bookings });

  const candidate =
    startMin === null || endMin === null || endMin <= startMin
      ? null
      : {
          start: startMin,
          end: endMin,
          valid: canBook(startMin, endMin, nowMin ?? FALLBACK_NOW, blocked, bookings).available,
        };

  const slotLabel =
    startMin !== null && endMin !== null
      ? `${minutesToHHMM(startMin)}–${minutesToHHMM(endMin)}`
      : 'Invalid time';

  function toggleEquipment(item: Equipment) {
    setEquipment((current) =>
      current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <Header
          roomName={room ? `Room ${room.id} · ${room.name} · ${room.capacity} seats` : 'No room selected'}
          dateLabel={TODAY}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
        />

        <RoomFinder
          attendeesStr={attendeesStr}
          attendeesInvalid={attendees === null}
          equipment={equipment}
          rooms={rooms}
          selectedId={room?.id ?? null}
          onAttendeesChange={setAttendeesStr}
          onEquipmentToggle={toggleEquipment}
          onSelect={setSelectedId}
        />

        {room && (
          <>
            <BookingForm
              startStr={startStr}
              endStr={endStr}
              nowStr={nowStr}
              startMin={startMin}
              endMin={endMin}
              nowMin={nowMin}
              blocked={blocked}
              blockedLocked={room.blocked}
              onStartChange={setStartStr}
              onEndChange={setEndStr}
              onNowChange={setNowStr}
              onBlockedChange={(value) => setSimulatedBlocks((s) => ({ ...s, [room.id]: value }))}
              onCheck={() => resultRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })}
            />

            <DayTimeline bookings={bookings} now={nowMin} candidate={candidate} />

            <div ref={resultRef}>
              <ResultPanel result={result} slotLabel={slotLabel} roomLabel={`Room ${room.id}`} />
            </div>
          </>
        )}

        <footer className="pb-4 text-center text-xs text-slate-400 dark:text-slate-600">
          Availability check only · no bookings are created or stored.
        </footer>
      </div>
    </div>
  );
}
