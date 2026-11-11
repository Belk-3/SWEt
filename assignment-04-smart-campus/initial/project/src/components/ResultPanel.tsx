import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { CanBookResult } from '@/lib/canBook';

interface ResultPanelProps {
  result: CanBookResult | null;
  slotLabel: string;
}

export default function ResultPanel({ result, slotLabel }: ResultPanelProps) {
  if (!result) {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30"
      >
        <Info size={22} className="mx-auto text-slate-400" />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter a start and end time, then check availability.
        </p>
      </section>
    );
  }

  const available = result.available;

  return (
    <section
      aria-live="assertive"
      role="status"
      className={`rounded-2xl border p-5 shadow-soft transition sm:p-6 ${
        available
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : 'border-red-200 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            available ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {available ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
        </div>
        <div>
          <p
            className={`text-xl font-bold leading-tight ${
              available ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
            }`}
          >
            {available ? 'Available' : 'Unavailable'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{slotLabel}</p>
        </div>
      </div>

      {result.reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {result.reasons.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      )}

      {available && (
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">
          This time slot is free and meets all rules. You can now book it elsewhere.
        </p>
      )}
    </section>
  );
}
