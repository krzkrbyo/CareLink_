interface BarChartProps {
  data: { label: string; value: number }[];
  barClassName?: string;
  height?: number;
}

export function BarChart({
  data,
  barClassName = "bg-care-accent-dark",
  height = 160,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full overflow-x-auto overflow-y-visible">
      <div
        className="flex min-w-[280px] justify-between gap-1.5 sm:gap-2"
        style={{ height }}
        role="img"
        aria-label="Gráfica de barras"
      >
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col">
              <span className="flex h-5 shrink-0 items-center justify-center text-xs font-semibold text-care-foreground tabular-nums">
                {d.value > 0 ? d.value : "\u00A0"}
              </span>
              <div className="flex min-h-0 flex-1 items-end justify-center">
                <div
                  className={`w-full max-w-[2.5rem] rounded-t-lg transition-all ${barClassName}`}
                  style={{
                    height: `${Math.max(pct, d.value > 0 ? 6 : 0)}%`,
                    opacity: d.value > 0 ? 1 : 0.15,
                  }}
                />
              </div>
              <span className="mt-1 flex h-4 shrink-0 items-start justify-center truncate text-center text-[10px] font-medium capitalize text-care-muted sm:text-xs">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
