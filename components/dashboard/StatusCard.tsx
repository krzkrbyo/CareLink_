import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBox } from "@/components/ui/icon-box";

interface StatusCardProps {
  title: string;
  status: string;
  detail?: string;
  icon?: LucideIcon;
  variant?: "success" | "warning" | "pending" | "danger";
}

const variants = {
  success: {
    card: "border-green-300 bg-green-50 text-green-900",
    icon: "success" as const,
  },
  warning: {
    card: "border-care-secondary bg-care-secondary/30 text-care-foreground",
    icon: "secondary" as const,
  },
  pending: {
    card: "border-slate-300 bg-slate-50 text-slate-900",
    icon: "muted" as const,
  },
  danger: {
    card: "border-red-300 bg-red-50 text-red-900",
    icon: "danger" as const,
  },
};

export function StatusCard({
  title,
  status,
  detail,
  icon: Icon,
  variant = "pending",
}: StatusCardProps) {
  const styles = variants[variant];

  return (
    <Card className={cn("border-2", styles.card)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {Icon && <IconBox icon={Icon} tone={styles.icon} size="sm" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{status}</p>
        {detail && <p className="mt-1 text-sm opacity-80">{detail}</p>}
      </CardContent>
    </Card>
  );
}
