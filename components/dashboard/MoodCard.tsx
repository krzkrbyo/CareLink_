import { Smile, Meh, Frown, HeartCrack, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBox } from "@/components/ui/icon-box";

interface MoodCardProps {
  mood: string;
}

const moodConfig: Record<string, { icon: LucideIcon; tone: "success" | "muted" | "secondary" | "accent" }> = {
  Bien: { icon: Smile, tone: "success" },
  Regular: { icon: Meh, tone: "muted" },
  Triste: { icon: Frown, tone: "secondary" },
  Solo: { icon: HeartCrack, tone: "accent" },
};

export function MoodCard({ mood }: MoodCardProps) {
  const config = moodConfig[mood] ?? { icon: HelpCircle, tone: "muted" as const };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Estado de ánimo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <IconBox icon={config.icon} tone={config.tone} size="lg" />
          <p className="text-2xl font-bold">{mood}</p>
        </div>
      </CardContent>
    </Card>
  );
}
