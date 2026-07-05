interface HorizontalBarChartProps {
  data: { label: string; value: number; percentage?: number }[];
  maxItems?: number;
}

export function HorizontalBarChart({ data, maxItems = 6 }: HorizontalBarChartProps) {
  const items = data.slice(0, maxItems);
  const max = Math.max(...items.map((d) => d.value), 1);

  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-care-muted">
        Sin actividades registradas en el periodo.
      </p>
    );
  }

  return (
    <ul className="space-y-3" role="list">
      {items.map((d) => {
        const pct = Math.round((d.value / max) * 100);
        return (
          <li key={d.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-care-foreground">{d.label}</span>
              <span className="shrink-0 tabular-nums text-care-muted">
                {d.value}
                {d.percentage != null ? ` (${d.percentage}%)` : ""}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-care-secondary/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-care-accent to-care-accent-dark transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
