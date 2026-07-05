import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarExportButtonProps {
  eventId: string;
  label?: string;
}

export function CalendarExportButton({
  eventId,
  label = "Exportar al calendario",
}: CalendarExportButtonProps) {
  return (
    <Link
      href={`/api/calendar/event/${eventId}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border-4 border-care-accent-dark bg-white px-6 py-3 text-lg font-semibold text-care-foreground hover:bg-care-primary"
      )}
      download
    >
      <Calendar className="h-5 w-5" />
      {label}
    </Link>
  );
}
