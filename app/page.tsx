import Link from "next/link";
import { Heart } from "lucide-react";
import { getSessionUser, getProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { LandingContent } from "@/components/landing/LandingContent";

export default async function LandingPage() {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;

  if (user && profile) {
    const destination = profile.role === "elder" ? "/adulto" : "/cuidador/resumen";
    const label = profile.role === "elder" ? "Ir a mi portal" : "Ir al portal familiar";

    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="care-surface max-w-md px-8 py-10 text-center">
          <IconBox icon={Heart} tone="accent" size="xl" className="mx-auto mb-4" />
          <p className="text-care-muted">
            Bienvenido de nuevo, <strong className="text-care-foreground">{profile.full_name}</strong>
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href={destination}>{label}</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <LandingContent />;
}
