"use client";

import { useState, useTransition } from "react";
import { Bell, CheckCircle2, Loader2, MessageCircleHeart } from "lucide-react";
import { confirmPersonalReminder } from "@/app/actions/elder";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { SectionHeader } from "@/components/layout/section-header";
import { VOICE_COMPANION_NAME } from "@/lib/voice-chat/constants";
import type { ElderPersonalReminderView } from "@/lib/data/elder-care-plan";
import Link from "next/link";

interface PersonalRemindersListProps {
  reminders: ElderPersonalReminderView[];
}

export function PersonalRemindersList({ reminders }: PersonalRemindersListProps) {
  const [pending, startTransition] = useTransition();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const pendingReminders = reminders.filter(
    (r) => r.status === "pending" && !completedIds.has(r.id)
  );
  const doneReminders = reminders.filter(
    (r) => r.status === "completed" || completedIds.has(r.id)
  );

  function handleComplete(id: string) {
    setActiveId(id);
    startTransition(async () => {
      const result = await confirmPersonalReminder(id);
      if (result.success) {
        setCompletedIds((prev) => new Set(prev).add(id));
      }
      setActiveId(null);
    });
  }

  return (
    <div className="space-y-8">
      <article className="care-surface border-care-accent/40 bg-gradient-to-br from-care-accent/10 to-white p-6">
        <div className="flex items-start gap-4">
          <IconBox icon={MessageCircleHeart} tone="accent" size="lg" />
          <div>
            <h3 className="text-xl font-bold text-care-foreground">
              Pídale a {VOICE_COMPANION_NAME} que le recuerde
            </h3>
            <p className="mt-2 text-care-muted">
              Abra el chat de voz y diga, por ejemplo: &quot;{VOICE_COMPANION_NAME}, recuérdame
              llamar a Ana a las tres de la tarde&quot; o &quot;recuérdame tomar agua en una hora&quot;.
            </p>
            <Button asChild variant="outline" size="default" className="mt-4 h-12">
              <Link href="/adulto?seccion=acompanante">Hablar con {VOICE_COMPANION_NAME}</Link>
            </Button>
          </div>
        </div>
      </article>

      <div>
        <SectionHeader
          icon={Bell}
          title="Mis recordatorios"
          description="Los que usted pidió por voz. Marque listo cuando los haya hecho."
        />

        {pendingReminders.length === 0 && doneReminders.length === 0 ? (
          <div className="care-surface mt-4 px-5 py-10 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-care-muted-light" />
            <p className="text-lg text-care-muted">
              Aún no tiene recordatorios. Hable con {VOICE_COMPANION_NAME} para crear uno.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingReminders.map((reminder) => {
              const loading = pending && activeId === reminder.id;
              return (
                <article key={reminder.id} className="care-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-care-accent/25 px-1 text-care-accent-darker">
                      <span className="text-[10px] font-semibold uppercase">{reminder.dateLabel}</span>
                      <span className="text-center text-xs font-bold leading-tight">{reminder.timeLabel}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold text-care-foreground">{reminder.displayTitle}</p>
                      <p className="mt-1 text-base text-care-muted">
                        Programado para <span className="font-semibold text-care-foreground">{reminder.timePhrase}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="default"
                    className="h-14 shrink-0 px-6"
                    disabled={loading}
                    onClick={() => handleComplete(reminder.id)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Ya lo hice
                      </>
                    )}
                  </Button>
                </article>
              );
            })}

            {doneReminders.length > 0 && (
              <div className="pt-2">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-care-muted">
                  Completados
                </p>
                <div className="space-y-2">
                  {doneReminders.map((reminder) => (
                    <article
                      key={reminder.id}
                      className="flex items-center gap-3 rounded-xl border border-care-secondary/50 bg-care-primary/30 px-4 py-3 opacity-70"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-care-foreground line-through">{reminder.displayTitle}</p>
                        <p className="text-sm text-care-muted">
                          {reminder.dateLabel} · {reminder.timePhrase}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
