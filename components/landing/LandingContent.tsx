"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Heart,
  MessageCircleHeart,
  Mic,
  Pill,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Utensils,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBox } from "@/components/ui/icon-box";
import { CareLinkLogo, CareLinkLogoMark } from "@/components/brand/CareLinkLogo";
import { cn } from "@/lib/utils";
import { AnimateIn } from "./AnimateIn";
import { AnimatedCounter } from "./AnimatedCounter";
import { VOICE_COMPANION_NAME } from "@/lib/voice-chat/constants";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#funciones", label: "Funciones" },
  { href: "#portales", label: "Portales" },
  { href: "#faq", label: "Preguntas" },
];

const STATS = [
  { value: 3, suffix: " recordatorios", label: "Medicamentos, comidas y citas en un solo lugar" },
  { value: 24, suffix: "/7", label: `${VOICE_COMPANION_NAME} disponible cuando lo necesite` },
  { value: 100, suffix: "%", label: "Diseñado con botones grandes y texto legible" },
];

const STEPS = [
  {
    step: "01",
    icon: Users,
    title: "La familia configura el plan",
    description:
      "El cuidador registra medicamentos, horarios de comida, citas médicas y reglas alimenticias desde un panel claro.",
  },
  {
    step: "02",
    icon: Smartphone,
    title: "El adulto mayor sigue su rutina",
    description:
      "Desde el portal con botones grandes confirma medicamentos, revisa comidas y habla con Link, su acompañante de voz.",
  },
  {
    step: "03",
    icon: Bell,
    title: "Todos reciben tranquilidad",
    description:
      "Alertas en tiempo real, gráficas de actividad y exportación de citas mantienen a la familia informada.",
  },
];

const FEATURE_TABS = [
  {
    id: "rutina",
    label: "Rutina diaria",
    icon: Pill,
    title: "Nunca olvidar lo importante",
    description:
      "Medicamentos con horarios flexibles, recordatorios de comidas según reglas alimenticias y próximas citas siempre visibles.",
    highlights: [
      "Confirmación con un solo toque",
      "Recordatorios en voz clara y pausada",
      "Historial de lo que ya tomó hoy",
    ],
  },
  {
    id: "voz",
    label: VOICE_COMPANION_NAME,
    icon: MessageCircleHeart,
    title: `${VOICE_COMPANION_NAME} escucha y habla`,
    description:
      `Compañía cálida por voz: ${VOICE_COMPANION_NAME} responde preguntas sobre la rutina, anima a completar tareas y puede pedir ayuda a la familia.`,
    highlights: [
      "Transcripción y respuesta inteligente",
      "Voz natural con ElevenLabs",
      "Modo accesible con botones grandes",
    ],
  },
  {
    id: "familia",
    label: "Panel familiar",
    icon: Activity,
    title: "Visibilidad sin invadir",
    description:
      "Dashboard en vivo con métricas, estado de ánimo, línea de tiempo de actividad y alertas que se resuelven desde el panel.",
    highlights: [
      "Gráficas de adherencia y actividad",
      "Alertas de ayuda y medicamentos omitidos",
      "Exportación .ics de citas al calendario",
    ],
  },
];

const PORTALS = [
  {
    href: "/login?redirect=/adulto",
    title: "Portal adulto mayor",
    description: "Interfaz simple, amable y accesible para el día a día.",
    icon: Heart,
    features: [
      "Botones grandes y colores suaves",
      "Hablar con Link",
      "Confirmar medicamento y comida",
      "Pedir ayuda con un toque",
    ],
    variant: "default" as const,
  },
  {
    href: "/login?redirect=/cuidador/resumen",
    title: "Portal familiar",
    description: "Seguimiento completo para quienes cuidan con cariño.",
    icon: Shield,
    features: [
      "Panel general y alertas",
      "Gráficas de actividad en vivo",
      "CRUD de medicamentos y citas",
      "Alta de nuevas personas a cargo",
    ],
    variant: "outline" as const,
  },
];

const FAQ = [
  {
    q: "¿Necesito instalar algo en el teléfono del adulto mayor?",
    a: "No. CareLink funciona en el navegador como una app web. Puede añadirse a la pantalla de inicio para acceso rápido, igual que una app nativa.",
  },
  {
    q: "¿Qué pasa si no toma su medicamento a tiempo?",
    a: "El sistema registra la omisión y genera una alerta visible en el panel del cuidador. También puede configurarse un flujo automatizado con n8n para notificaciones externas.",
  },
  {
    q: `¿${VOICE_COMPANION_NAME} funciona sin internet?`,
    a: "Requiere conexión para transcribir, generar respuestas y reproducir voz. La interfaz de rutina básica sigue siendo usable offline parcialmente, pero la voz necesita red.",
  },
  {
    q: "¿Puedo probar la demo antes de registrarme?",
    a: "Sí. Use las credenciales demo (Ana cuidadora / Don Manuel adulto mayor) descritas abajo, o cree su cuenta gratuita en segundos.",
  },
];

function scrollToSection(href: string) {
  const id = href.replace("#", "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingContent() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(FEATURE_TABS[0].id);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [voiceDemo, setVoiceDemo] = useState<"idle" | "listening" | "speaking">("idle");

  const activeFeature = FEATURE_TABS.find((t) => t.id === activeTab) ?? FEATURE_TABS[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVoiceDemo((prev) => {
        if (prev === "idle") return "listening";
        if (prev === "listening") return "speaking";
        return "idle";
      });
    }, 3200);
    return () => clearInterval(cycle);
  }, []);

  return (
    <main className="care-gradient-page min-h-dvh overflow-x-hidden">
      {/* Floating background orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="landing-orb landing-orb-1" />
        <div className="landing-orb landing-orb-2" />
        <div className="landing-orb landing-orb-3" />
      </div>

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-care-secondary/60 bg-white/80 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <CareLinkLogo href="/" size="md" pulse />

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                type="button"
                onClick={() => scrollToSection(href)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-care-muted transition-colors hover:bg-care-accent/20 hover:text-care-foreground"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="default" className="hidden h-11 text-base sm:inline-flex">
              <Link href="/signup">Registrarse</Link>
            </Button>
            <Button asChild variant="outline" size="default" className="h-11 text-base">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <AnimateIn animation="fade-up" delay={0}>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-care-accent/30 px-4 py-1.5 text-sm font-semibold text-care-accent-darker">
                <Sparkles className="h-4 w-4" />
                Cuidado con cariño, todos los días
              </p>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={100}>
              <h1 className="text-4xl font-bold leading-tight text-care-foreground lg:text-[3.25rem] lg:leading-[1.1]">
                Acompañamiento sencillo para{" "}
                <span className="landing-text-gradient">adultos mayores</span> y sus familias
              </h1>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={200}>
              <p className="mt-5 max-w-xl text-lg text-care-muted lg:text-xl">
                Medicamentos, comidas, citas y {VOICE_COMPANION_NAME}, su acompañante de voz que habla con paciencia.
                CareLink conecta la rutina diaria con la tranquilidad de quienes cuidan.
              </p>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={300}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="text-lg landing-cta-glow">
                  <Link href="/signup">Crear cuenta gratis</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link href="/login">Ya tengo cuenta</Link>
                </Button>
              </div>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={400}>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-care-muted">
                {["Sin instalación", "Accesible y en español", "Alertas en tiempo real"].map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-care-accent-dark" />
                    {tag}
                  </span>
                ))}
              </div>
            </AnimateIn>
          </div>

          {/* Hero mockup */}
          <AnimateIn animation="scale-in" delay={200}>
            <div className="landing-hero-card care-surface relative overflow-hidden p-6 lg:p-8">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-care-accent/20 blur-2xl" />
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "relative mb-4 overflow-hidden rounded-3xl border-4 border-care-secondary/80 bg-care-primary shadow-inner transition-all duration-500",
                    voiceDemo === "speaking" && "landing-voice-speaking",
                    voiceDemo === "listening" && "landing-voice-listening"
                  )}
                >
                  <video
                    src="/avatar/tortuga.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-48 w-48 object-cover lg:h-56 lg:w-56"
                  />
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-care-foreground shadow-sm">
                    {voiceDemo === "idle" && (
                      <>
                        <MessageCircleHeart className="h-3.5 w-3.5 text-care-accent-dark" />
                        {VOICE_COMPANION_NAME} lista para acompañar
                      </>
                    )}
                    {voiceDemo === "listening" && (
                      <>
                        <Mic className="h-3.5 w-3.5 animate-pulse text-red-500" />
                        Escuchando…
                      </>
                    )}
                    {voiceDemo === "speaking" && (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-care-accent-dark" />
                        Respondiendo…
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-3">
                  {[
                    { icon: Pill, label: "Paracetamol 500 mg", time: "08:00 — Confirmado", done: true },
                    { icon: Utensils, label: "Desayuno ligero", time: "09:30 — Pendiente", done: false },
                    { icon: Calendar, label: "Cita cardiólogo", time: "Jueves 10:00", done: false },
                  ].map(({ icon: Icon, label, time, done }) => (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-300",
                        done
                          ? "border-green-200 bg-green-50/80"
                          : "border-care-secondary/60 bg-white hover:border-care-accent/50"
                      )}
                    >
                      <IconBox icon={Icon} tone={done ? "success" : "accent"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-care-foreground">{label}</p>
                        <p className="text-xs text-care-muted">{time}</p>
                      </div>
                      {done && <Check className="h-5 w-5 shrink-0 text-green-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {STATS.map(({ value, suffix, label }, i) => (
            <AnimateIn key={label} animation="fade-up" delay={i * 100} as="article">
              <div className="care-surface landing-stat-card p-6 text-center">
                <p className="text-4xl font-bold text-care-accent-darker">
                  <AnimatedCounter value={value} suffix={suffix} />
                </p>
                <p className="mt-2 text-sm text-care-muted">{label}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="care-section-anchor mx-auto max-w-6xl px-6 pb-20">
        <AnimateIn animation="fade-up">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-care-accent-darker">
              Simple de usar
            </p>
            <h2 className="text-3xl font-bold text-care-foreground lg:text-4xl">¿Cómo funciona CareLink?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-care-muted">
              Tres pasos para conectar la rutina del adulto mayor con la visibilidad que la familia necesita.
            </p>
          </div>
        </AnimateIn>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div aria-hidden className="landing-timeline hidden md:block" />
          {STEPS.map(({ step, icon, title, description }, i) => (
            <AnimateIn key={step} animation="fade-up" delay={i * 120} as="article">
              <div className="care-surface landing-step-card relative h-full p-6">
                <span className="mb-4 inline-block rounded-full bg-care-accent/30 px-3 py-1 text-xs font-bold text-care-accent-darker">
                  Paso {step}
                </span>
                <IconBox icon={icon} tone="accent" size="lg" className="mb-4" />
                <h3 className="text-lg font-bold text-care-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-care-muted">{description}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* Interactive features */}
      <section id="funciones" className="care-section-anchor mx-auto max-w-6xl px-6 pb-20">
        <AnimateIn animation="fade-up">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-care-foreground lg:text-4xl">Todo lo que incluye</h2>
            <p className="mx-auto mt-3 max-w-2xl text-care-muted">
              Explore las funciones principales. Haga clic en cada pestaña para ver más detalle.
            </p>
          </div>
        </AnimateIn>

        <div className="care-surface overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-care-secondary/60 bg-care-primary/40 p-4">
            {FEATURE_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                  activeTab === id
                    ? "bg-care-accent-dark text-white shadow-md"
                    : "text-care-muted hover:bg-care-accent/20 hover:text-care-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div key={activeTab} className="landing-tab-content grid gap-8 p-6 lg:grid-cols-2 lg:p-8">
            <div>
              <IconBox icon={activeFeature.icon} tone="accent" size="lg" className="mb-4" />
              <h3 className="text-2xl font-bold text-care-foreground">{activeFeature.title}</h3>
              <p className="mt-3 text-care-muted">{activeFeature.description}</p>
              <ul className="mt-6 space-y-3">
                {activeFeature.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-care-muted">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-care-accent-dark" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-care-accent/20 to-care-secondary/30 p-8">
              <div className="grid w-full max-w-xs gap-3">
                {activeFeature.highlights.map((item, i) => (
                  <div
                    key={item}
                    className="landing-highlight-chip flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-sm"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-care-accent/40 text-xs font-bold text-care-accent-darker">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-care-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section id="portales" className="care-section-anchor mx-auto max-w-6xl px-6 pb-20">
        <AnimateIn animation="fade-up">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-care-foreground lg:text-4xl">Elija su portal</h2>
            <p className="mt-2 text-care-muted">Dos experiencias diseñadas para cada rol. Inicie sesión con su cuenta.</p>
          </div>
        </AnimateIn>

        <div className="grid gap-6 md:grid-cols-2">
          {PORTALS.map(({ href, title, description, icon, features, variant }, i) => (
            <AnimateIn key={href} animation={i === 0 ? "slide-right" : "slide-left"} delay={100} as="article">
              <div className="care-surface landing-portal-card flex h-full flex-col p-6 lg:p-8">
                <div className="mb-4 flex items-start gap-4">
                  <IconBox icon={icon} tone="accent" size="lg" />
                  <div>
                    <h3 className="text-xl font-bold text-care-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-care-muted">{description}</p>
                  </div>
                </div>
                <ul className="mb-6 flex-1 space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-care-muted">
                      <Check className="h-4 w-4 shrink-0 text-care-accent-dark" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button size="lg" variant={variant} asChild className="mt-auto w-full">
                  <Link href={href}>Entrar al portal</Link>
                </Button>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* Demo credentials */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <AnimateIn animation="fade-up">
          <div className="care-surface landing-demo-banner overflow-hidden p-6 lg:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-care-accent-darker">
                  Pruebe la demo
                </p>
                <h3 className="text-2xl font-bold text-care-foreground">Conozca a Ana y Don Manuel</h3>
                <p className="mt-2 text-care-muted">
                  Datos de ejemplo precargados para explorar el panel familiar y el portal del adulto mayor sin
                  configurar nada.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { role: "Cuidadora", email: "ana@carelink.app", pass: "CareLink2026!" },
                  { role: "Adulto mayor", email: "manuel@carelink.app", pass: "CareLink2026!" },
                ].map(({ role, email, pass }) => (
                  <div key={email} className="rounded-xl border-2 border-care-secondary/60 bg-white/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-care-accent-darker">{role}</p>
                    <p className="mt-2 truncate text-sm font-medium text-care-foreground">{email}</p>
                    <p className="text-xs text-care-muted">Contraseña: {pass}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* FAQ */}
      <section id="faq" className="care-section-anchor mx-auto max-w-3xl px-6 pb-20">
        <AnimateIn animation="fade-up">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-care-foreground">Preguntas frecuentes</h2>
            <p className="mt-2 text-care-muted">Resolvemos las dudas más comunes antes de empezar.</p>
          </div>
        </AnimateIn>

        <div className="space-y-3">
          {FAQ.map(({ q, a }, i) => (
            <AnimateIn key={q} animation="fade-up" delay={i * 60} as="article">
              <div className="care-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-care-primary/30"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-care-foreground">{q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-care-muted transition-transform duration-300",
                      openFaq === i && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-care-secondary/50 px-5 pb-5 pt-3 text-sm leading-relaxed text-care-muted">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <AnimateIn animation="scale-in">
          <div className="landing-cta-section rounded-3xl px-8 py-12 text-center lg:px-16">
            <h2 className="text-3xl font-bold text-white lg:text-4xl">Empiece a cuidar con más tranquilidad</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Regístrese en minutos y conecte a su familia con una rutina clara, humana y siempre acompañada.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link href="/signup">Crear cuenta gratis</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/60 bg-white/10 text-lg text-white hover:bg-white/20"
              >
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </div>
          </div>
        </AnimateIn>
      </section>

      <footer className="border-t border-care-secondary/50 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-care-muted">
            <CareLinkLogoMark size="sm" className="shadow-sm" />
            <span className="text-sm">CareLink — Acompañamiento con cariño</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/signup" className="font-semibold text-care-accent-dark hover:underline">
              Crear cuenta
            </Link>
            <Link href="/login" className="font-semibold text-care-accent-dark hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
