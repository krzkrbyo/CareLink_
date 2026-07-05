"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useElderDashboard(elderId: string, onUpdate: () => void) {
  const refresh = useCallback(onUpdate, [onUpdate]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-${elderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interactions",
          filter: `elder_id=eq.${elderId}`,
        },
        () => refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `elder_id=eq.${elderId}`,
        },
        () => refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reminders",
          filter: `elder_id=eq.${elderId}`,
        },
        () => refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "elders",
          filter: `id=eq.${elderId}`,
        },
        () => refresh()
      )
      .subscribe();

    const poll = setInterval(refresh, 8000);
    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [elderId, refresh]);
}
