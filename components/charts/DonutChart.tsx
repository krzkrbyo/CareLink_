interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
}

const COLORS = [
  "#9b87b5",
  "#c5b3d3",
  "#7a6694",
  "#f5cbcb",
  "#b8a0c9",
  "#6b5a73",
];

export function DonutChart({ data, size = 140 }: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-care-secondary/30 text-sm text-care-muted"
        style={{ width: size, height: size }}
      >
        Sin datos
      </div>
    );
  }

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    return { ...d, start, end, color: d.color ?? COLORS[i % COLORS.length] };
  });

  const r = 40;
  const cx = 50;
  const cy = 50;

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="-rotate-90"
          role="img"
          aria-label="Distribución de actividades"
        >
          {segments.map((seg) =>
            seg.value > 0 ? (
              <path
                key={seg.label}
                d={arc(seg.start, seg.end - 0.5)}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
              />
            ) : null
          )}
        </svg>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="text-xl font-bold text-care-foreground">{total}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="truncate text-care-foreground">{seg.label}</span>
            <span className="ml-auto tabular-nums text-care-muted">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
