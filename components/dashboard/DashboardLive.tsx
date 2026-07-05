"use client";

import { useRouter } from "next/navigation";
import { useElderDashboard } from "@/hooks/use-elder-dashboard";

export function DashboardLive({ elderId }: { elderId: string }) {
  const router = useRouter();
  useElderDashboard(elderId, () => router.refresh());
  return null;
}
