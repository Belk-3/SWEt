import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';
import DayTimeline from '@/components/DayTimeline';
import ResultPanel from '@/components/ResultPanel';
import { canBook } from '@/lib/canBook';
import { hhmmToMinutes, minutesToHHMM, type Interval } from '@/lib/time';

const ROOM_NAME = 'Room B-204 · Lab · 30 seats';

// Existing bookings for today (minutes after midnight): 10:00–11:00.
const EXISTING: Interval[] = [[600, 660]];

const TODAY = new Date(2026, 9, 24).toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

export default function App() {
  const [startStr, setStartStr] = useState('11:00');
  const [endStr, setEndStr] = useState('12:00');
  const [nowStr, setNowStr] = useState('09:00');
  const [blocked, setBlocked] = useState(false);
  const [dark, setDark] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof canBook> | null>(null);

  const startMin = useMemo(() => hhmmToMinutes(startStr), [startStr]);
  const endMin = useMemo(() => hhmmToMinutes(endStr), [endStr]);
  const nowMin = useMemo(() => hhmmToMinutes(nowStr), [nowStr]);

  const candidate = useMemo(() => {
    if (startMin === null || endMin === null || endMin <= startMin) return null;
    // valid preview = would currently pass (ignoring inputs being well-formed already handled)
    const probe = canBook(startMin, endMin, nowMin ?? 540, blocked, EXISTING);
    return { start: startMin, end: endMin, valid: probe.available };
  }, [startMin, endMin, nowMin, blocked]);

  const slotLabel =
    startMin !== null && endMin !== null
      ? `${minutesToHHMM(startMin)}–${minutesToHHMM(endMin)}`
      : 'Invalid time';

  // Recompute the result whenever any input changes so the panel never contradicts the current form state.
  useEffect(() => {
    if (startMin === null || endMin === null || nowMin === null) {
      const reasons: string[] = [];
      if (startMin === null) reasons.push('Start time must be in HH:MM format.');
      if (endMin === null) reasons.push('End time must be in HH:MM format.');
      if (nowMin === null) reasons.push('Simulated current time must be in HH:MM format.');
      setResult({ available: false, reasons });
      return;
    }
    setResult(canBook(startMin, endMin, nowMin, blocked, EXISTING));
  }, [startMin, endMin, nowMin, blocked]);

  function handleCheck() {
    if (startMin === null || endMin === null || nowMin === null) {
      const reasons: string[] = [];
      if (startMin === null) reasons.push('Start time must be in HH:MM format.');
      if (endMin === null) reasons.push('End time must be in HH:MM format.');
      if (nowMin === null) reasons.push('Simulated current time must be in HH:MM format.');
      setResult({ available: false, reasons });
      return;
    }
    // never mutate inputs / existing array
    setResult(canBook(startMin, endMin, nowMin, blocked, EXISTING));
  }

  const html = document.documentElement;
  if (dark) html.classList.add('dark');
  else html.classList.remove('dark');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-6 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <Header
          roomName={ROOM_NAME}
          dateLabel={TODAY}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
        />

        <BookingForm
          startStr={startStr}
          endStr={endStr}
          nowStr={nowStr}
          blocked={blocked}
          onStartChange={setStartStr}
          onEndChange={setEndStr}
          onNowChange={setNowStr}
          onBlockedChange={setBlocked}
          onCheck={handleCheck}
        />

        <DayTimeline
          existing={EXISTING.map(([s, e]) => ({ start: s, end: e, label: 'Booked' }))}
          now={nowMin}
          candidate={candidate}
        />

        <ResultPanel result={result} slotLabel={slotLabel} />

        <footer className="pb-4 text-center text-xs text-slate-400 dark:text-slate-600">
          Availability check only · no bookings are created or stored.
        </footer>
      </div>
    </div>
  );
}
