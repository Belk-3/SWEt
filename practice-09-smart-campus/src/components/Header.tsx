import { DoorOpen, CalendarDays } from 'lucide-react';

interface HeaderProps {
  roomName: string;
  dateLabel: string;
  dark: boolean;
  onToggleDark: () => void;
}

export default function Header({ roomName, dateLabel, dark, onToggleDark }: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-soft">
          <DoorOpen size={22} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50 sm:text-xl">
            {roomName}
          </h1>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
            <CalendarDays size={13} />
            Today · {dateLabel}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleDark}
        aria-pressed={dark}
        className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {dark ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
