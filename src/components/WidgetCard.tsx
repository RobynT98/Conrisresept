import { Link } from "react-router-dom";

type Props = {
  title: string;
  icon?: string;           // emoji funkar fint här
  to?: string;             // valfri länk för action uppe till höger
  actionLabel?: string;    // t.ex. "Öppna", "Sök", "Lägg till"
  children: React.ReactNode;
};

export default function WidgetCard({ title, icon, to, actionLabel, children }: Props) {
  return (
    <section className="rounded-2xl border border-amber-100 bg-white/80 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-forest/10 text-lg leading-none"
            >
              {icon}
            </span>
          )}
          <h2 className="text-xs tracking-wider uppercase text-forest/80">{title}</h2>
        </div>

        {to && actionLabel && (
          <Link
            to={to}
            className="px-3 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-sm"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-gradient-to-r from-transparent via-amber-100 to-transparent" />

      {/* Body */}
      <div className="px-4 py-3 text-sm text-neutral-800">{children}</div>
    </section>
  );
}