import { useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { hhmmToMinutes, minutesToHHMM } from '@/lib/time';

interface BookingFormProps {
  startStr: string;
  endStr: string;
  nowStr: string;
  blocked: boolean;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onNowChange: (v: string) => void;
  onBlockedChange: (v: boolean) => void;
  onCheck: () => void;
}

function TimeField({
  id,
  label,
  value,
  onChange,
  hint,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
          invalid
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/60'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-slate-700'
        }`}
      />
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function BookingForm({
  startStr,
  endStr,
  nowStr,
  blocked,
  onStartChange,
  onEndChange,
  onNowChange,
  onBlockedChange,
  onCheck,
}: BookingFormProps) {
  const startMin = useMemo(() => hhmmToMinutes(startStr), [startStr]);
  const endMin = useMemo(() => hhmmToMinutes(endStr), [endStr]);
  const nowMin = useMemo(() => hhmmToMinutes(nowStr), [nowStr]);

  const startInvalid = startStr !== '' && startMin === null;
  const endInvalid = endStr !== '' && endMin === null;
  const nowInvalid = nowStr !== '' && nowMin === null;

  return (
    <section
      aria-labelledby="form-title"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-700 dark:bg-slate-800/60 sm:p-6"
    >
      <h2 id="form-title" className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        Check a time slot
      </h2>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <TimeField
          id="start"
          label="Start time"
          value={startStr}
          onChange={onStartChange}
          invalid={startInvalid}
          hint={startMin !== null ? `= ${startMin} min` : '00:00–24:00'}
        />
        <TimeField
          id="end"
          label="End time"
          value={endStr}
          onChange={onEndChange}
          invalid={endInvalid}
          hint={endMin !== null ? `= ${endMin} min` : '00:00–24:00'}
        />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/60">
        <label htmlFor="now" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Clock size={14} className="text-indigo-500" />
          Simulated current time
        </label>
        <div className="flex items-center gap-3">
          <input
            id="now"
            type="text"
            inputMode="numeric"
            placeholder="HH:MM"
            value={nowStr}
            onChange={(e) => onNowChange(e.target.value)}
            aria-invalid={nowInvalid}
            className={`w-28 rounded-xl border bg-white px-3 py-2.5 font-mono text-sm text-slate-900 outline-none transition focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
              nowInvalid
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/60'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-slate-700'
            }`}
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {nowMin !== null ? `= ${nowMin} min · ${minutesToHHMM(nowMin)}` : 'used for the "now" rule'}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
          <span className="relative inline-flex h-6 w-11 shrink-0">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => onBlockedChange(e.target.checked)}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500/40 dark:bg-slate-600" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            <AlertTriangle size={14} className={blocked ? 'text-amber-500' : 'text-slate-400'} />
            Room blocked (maintenance)
          </span>
        </label>

        <button
          type="button"
          onClick={onCheck}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:ring-offset-slate-900"
        >
          Check availability
        </button>
      </div>
    </section>
  );
}
