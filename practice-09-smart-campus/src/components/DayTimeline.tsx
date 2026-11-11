import { useEffect, useRef } from 'react';

interface DayTimelineProps {
  existing: readonly { start: number; end: number; label: string }[];
  now: number | null;
  candidate: { start: number; end: number; valid: boolean } | null;
}

const DAY_START = 0; // 0 min
const DAY_END = 1440; // 24:00
const VISIBLE_START = 8 * 60; // 08:00
const VISIBLE_END = 20 * 60; // 20:00

const HOURS = Array.from({ length: 25 }, (_, i) => i); // 0..24

function pct(min: number): string {
  return `${(min / DAY_END) * 100}%`;
}

export default function DayTimeline({ existing, now, candidate }: DayTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep the visible window centered on 08:00–20:00 on mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const totalWidth = el.scrollWidth;
    const visibleStartRatio = VISIBLE_START / DAY_END;
    el.scrollLeft = totalWidth * visibleStartRatio;
  }, []);

  return (
    <section
      aria-label="Day timeline"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60 sm:p-6"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Today's timeline</h2>
        <span className="text-xs text-slate-400 dark:text-slate-500">08:00–20:00 shown · scroll for full day</span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-2">
        <div className="relative h-28" style={{ width: `${(DAY_END / (VISIBLE_END - VISIBLE_START)) * 100}%`, minWidth: '1152px' }}>
          {/* Hour grid lines + labels */}
          {HOURS.map((h) => {
            const min = h * 60;
            return (
              <div key={h} className="absolute top-0 bottom-0" style={{ left: pct(min) }}>
                <div className="h-full w-px bg-slate-100 dark:bg-slate-700/50" />
                <span className="absolute -top-0.5 -translate-x-1/2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            );
          })}

          {/* Track */}
          <div className="absolute inset-x-0 top-5 bottom-0 rounded-lg bg-slate-50 ring-1 ring-inset ring-slate-100 dark:bg-slate-900/40 dark:ring-slate-700/50" />

          {/* Existing bookings */}
          {existing.map((b, i) => (
            <div
              key={i}
              className="absolute top-7 bottom-2 rounded-md bg-indigo-500/85 ring-1 ring-inset ring-indigo-400/50"
              style={{ left: pct(b.start), width: `${((b.end - b.start) / DAY_END) * 100}%` }}
              title={`${b.label}: ${fmt(b.start)}–${fmt(b.end)}`}
            >
              <span className="absolute left-1.5 top-1 truncate text-[10px] font-semibold text-white">
                {fmt(b.start)}–{fmt(b.end)}
              </span>
            </div>
          ))}

          {/* Candidate preview */}
          {candidate && (
            <div
              className={`absolute top-6 bottom-1 rounded-md border-2 ${
                candidate.valid
                  ? 'border-emerald-500 bg-emerald-400/30'
                  : 'border-red-500 bg-red-400/30'
              }`}
              style={{ left: pct(candidate.start), width: `${((candidate.end - candidate.start) / DAY_END) * 100}%` }}
              title={`Your slot: ${fmt(candidate.start)}–${fmt(candidate.end)}`}
            />
          )}

          {/* Now marker */}
          {now !== null && now >= 0 && now <= DAY_END && (
            <div className="absolute top-0 bottom-0 z-10" style={{ left: pct(now) }}>
              <div className="h-full w-0.5 bg-teal-500" />
              <div className="absolute -top-0.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-800" />
              <span className="absolute -bottom-1 left-1.5 rounded bg-white px-1 text-[10px] font-semibold text-teal-600 shadow-sm dark:bg-slate-800 dark:text-teal-400">
                now {fmt(now)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Legend color="bg-indigo-500/85" label="Existing booking" />
        <Legend color="bg-emerald-400/60 ring-2 ring-emerald-500" label="Your slot (valid)" />
        <Legend color="bg-red-400/60 ring-2 ring-red-500" label="Your slot (invalid)" />
        <Legend color="bg-teal-500" label="Now" />
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${color}`} />
      {label}
    </span>
  );
}

function fmt(min: number): string {
  if (min === 1440) return '24:00';
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}
