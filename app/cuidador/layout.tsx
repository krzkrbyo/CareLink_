import { redirect } from "next/navigation";
import { requireCaregiver, getCaregiverElders } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function CuidadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireCaregiver();
  const elders = await getCaregiverElders(user.id);

  return (
    <AppShell
      role="caregiver"
      userName={profile.full_name}
      avatarUrl={profile.avatar_url ?? null}
      elders={elders}
    >
      {children}
    </AppShell>
  );
}
