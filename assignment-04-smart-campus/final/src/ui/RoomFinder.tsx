import { SearchX } from 'lucide-react';
import { EQUIPMENT, type Equipment, type Room } from '@/data/rooms';

interface RoomFinderProps {
  attendeesStr: string;
  attendeesInvalid: boolean;
  equipment: readonly Equipment[];
  rooms: readonly Room[];
  selectedId: string | null;
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (item: Equipment) => void;
  onSelect: (id: string) => void;
}

export default function RoomFinder({
  attendeesStr,
  attendeesInvalid,
  equipment,
  rooms,
  selectedId,
  onAttendeesChange,
  onEquipmentToggle,
  onSelect,
}: RoomFinderProps) {
  return (
    <section
      aria-labelledby="finder-title"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60 sm:p-6"
    >
      <h2 id="finder-title" className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        Find a room
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <div className="sm:w-40">
          <label htmlFor="attendees" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Attendees
          </label>
          <input
            id="attendees"
            type="text"
            inputMode="numeric"
            placeholder="Any"
            value={attendeesStr}
            onChange={(e) => onAttendeesChange(e.target.value)}
            aria-invalid={attendeesInvalid}
            className={`w-full rounded-xl border bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
              attendeesInvalid
                ? 'border-red-400 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-slate-700'
            }`}
          />
          {attendeesInvalid && (
            <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
              Enter a whole number of at least 1. Capacity is not being filtered.
            </p>
          )}
        </div>

        <fieldset className="flex-1">
          <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Required equipment</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {EQUIPMENT.map((item) => (
              <label key={item} className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={equipment.includes(item)}
                  onChange={() => onEquipmentToggle(item)}
                  className="h-4 w-4 accent-indigo-600"
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {rooms.length === 0 ? (
        <div role="status" className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <SearchX size={22} className="mx-auto text-slate-400" />
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">No rooms match your requirements.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Lower the attendee count or clear some equipment.</p>
        </div>
      ) : (
        <div role="radiogroup" aria-label="Matching rooms" className="mt-5 grid gap-3 sm:grid-cols-2">
          {rooms.map((room) => {
            const selected = room.id === selectedId;
            return (
              <label
                key={room.id}
                className={`block cursor-pointer rounded-xl border p-3 transition ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="room"
                  className="sr-only"
                  checked={selected}
                  onChange={() => onSelect(room.id)}
                  aria-label={`${room.id} ${room.name}`}
                />
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {room.id} · {room.name}
                  </span>
                  {room.blocked && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                      Blocked
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  {room.capacity} seats · {room.equipment.join(', ')}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
