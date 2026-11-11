import { CheckCircle2, XCircle } from 'lucide-react';
import type { CanBookResult } from '@/rules/availability';

interface ResultPanelProps {
  result: CanBookResult;
  slotLabel: string;
  roomLabel: string;
}

export default function ResultPanel({ result, slotLabel, roomLabel }: ResultPanelProps) {
  const { available, reasons } = result;

  return (
    <section
      aria-live="assertive"
      role="status"
      data-testid="result"
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {roomLabel} · {slotLabel}
          </p>
        </div>
      </div>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-hidden />
              {reason}
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
