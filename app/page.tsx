import Link from "next/link";
import { Check, Heart, MessageCircleHeart, Pill, Shield, Users } from "lucide-react";
import { getSessionUser, getProfile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";

const FEATURES = [
  {
    icon: Pill,
    title: "Rutina al día",
    description: "Medicamentos, comidas y citas organizados en un solo lugar.",
  },
  {
    icon: MessageCircleHeart,
    title: "Acompañante de voz",
    description: "Una tortuguita amable que habla, escucha y acompaña con cariño.",
  },
  {
    icon: Users,
    title: "Familia conectada",
    description: "Los cuidadores ven el avance y reciben alertas cuando hace falta.",
  },
];

const PORTALS = [
  {
    href: "/login?redirect=/adulto",
    title: "Portal adulto mayor",
    description: "Interfaz simple con botones grandes para la rutina diaria.",
    icon: Heart,
    features: ["Recordatorios en voz", "Confirmar medicamento y comida", "Pedir ayuda a la familia"],
    variant: "default" as const,
  },
  {
    href: "/login?redirect=/cuidador/resumen",
    title: "Portal familiar",
    description: "Panel de seguimiento para quienes cuidan a un adulto mayor.",
    icon: Shield,
    features: ["Panel general y alertas", "Gráficas de actividad", "Plan de medicamentos y citas"],
    variant: "outline" as const,
  },
];

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

  return (
    <main className="care-gradient-page min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-care-accent-dark text-white shadow-md">
            <Heart className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-care-foreground">CareLink</span>
        </div>
        <Button asChild variant="outline">
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-care-accent/30 px-4 py-1.5 text-sm font-semibold text-care-accent-darker">
              Cuidado con cariño, todos los días
            </p>
            <h1 className="text-4xl font-bold leading-tight text-care-foreground lg:text-5xl">
              Acompañamiento sencillo para adultos mayores y sus familias
            </h1>
            <p className="mt-5 max-w-xl text-lg text-care-muted lg:text-xl">
              CareLink ayuda con medicamentos, comidas, citas y una tortuguita de voz que
              acompaña con paciencia y calidez.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-lg">
                <Link href="/login">Comenzar</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg">
                <Link href="/signup">Crear cuenta</Link>
              </Button>
            </div>
          </div>

          <div className="care-surface p-8">
            <div className="mb-6 flex items-center gap-4">
              <IconBox icon={Heart} tone="accent" size="lg" />
              <div>
                <h2 className="text-xl font-bold text-care-foreground">Todo en un solo lugar</h2>
                <p className="text-care-muted">Diseñado para ser claro, humano y fácil de usar.</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Recordatorios de medicamentos y comidas",
                "Chat de voz con acompañante amable",
                "Panel familiar con alertas y seguimiento",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-care-muted">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-care-accent-dark" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon, title, description }) => (
            <article key={title} className="care-surface p-6">
              <IconBox icon={icon} tone="accent" size="md" className="mb-4" />
              <h3 className="text-lg font-bold text-care-foreground">{title}</h3>
              <p className="mt-2 text-sm text-care-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-care-foreground">Elija su portal</h2>
          <p className="mt-2 text-care-muted">
            Después podrá iniciar sesión con su cuenta.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PORTALS.map(({ href, title, description, icon, features, variant }) => (
            <article key={href} className="care-surface flex flex-col p-6">
              <div className="mb-4 flex items-start gap-4">
                <IconBox icon={icon} tone="accent" size="lg" />
                <div>
                  <h3 className="text-xl font-bold text-care-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-care-muted">{description}</p>
                </div>
              </div>
              <ul className="mb-6 space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-care-muted">
                    <Check className="h-4 w-4 shrink-0 text-care-accent-dark" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant={variant} asChild className="mt-auto w-full">
                <Link href={href}>Entrar</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-care-secondary/50 px-6 py-8 text-center text-sm text-care-muted">
        ¿Nuevo en CareLink?{" "}
        <Link href="/signup" className="font-semibold text-care-accent-dark underline">
          Crear cuenta
        </Link>
      </footer>
    </main>
  );
}
