import {
  Activity,
  Apple,
  Bandage,
  Bike,
  BookOpen,
  Brain,
  Building2,
  CalendarClock,
  Coffee,
  Cookie,
  Droplet,
  Droplets,
  Dumbbell,
  FlaskConical,
  Footprints,
  GlassWater,
  Heart,
  HeartPulse,
  Microscope,
  Moon,
  Music,
  Palette,
  Pill,
  PillBottle,
  Salad,
  Scan,
  SprayCan,
  Stethoscope,
  Sun,
  Syringe,
  Tablet,
  Tablets,
  TreePine,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";

export const CARE_ICONS = {
  pill: Pill,
  tablets: Tablets,
  tablet: Tablet,
  "pill-bottle": PillBottle,
  syringe: Syringe,
  "flask-conical": FlaskConical,
  droplet: Droplet,
  "spray-can": SprayCan,
  bandage: Bandage,
  "heart-pulse": HeartPulse,
  brain: Brain,
  heart: Heart,
  "utensils-crossed": UtensilsCrossed,
  coffee: Coffee,
  apple: Apple,
  salad: Salad,
  sun: Sun,
  moon: Moon,
  cookie: Cookie,
  activity: Activity,
  dumbbell: Dumbbell,
  footprints: Footprints,
  bike: Bike,
  "book-open": BookOpen,
  "tree-pine": TreePine,
  music: Music,
  palette: Palette,
  droplets: Droplets,
  "glass-water": GlassWater,
  waves: Waves,
  "calendar-clock": CalendarClock,
  stethoscope: Stethoscope,
  building: Building2,
  microscope: Microscope,
  scan: Scan,
} as const;

export type CareIconKey = keyof typeof CARE_ICONS;

export const CARE_ICON_LABELS: Record<CareIconKey, string> = {
  pill: "Pastilla",
  tablets: "Pastillas",
  tablet: "Tableta",
  "pill-bottle": "Frasco",
  syringe: "Inyección",
  "flask-conical": "Jarabe",
  droplet: "Gotas",
  "spray-can": "Inhalador",
  bandage: "Parche / crema",
  "heart-pulse": "Corazón",
  brain: "Cerebro",
  heart: "Corazón simple",
  "utensils-crossed": "Comida",
  coffee: "Café / desayuno",
  apple: "Fruta",
  salad: "Ensalada",
  sun: "Mediodía",
  moon: "Noche",
  cookie: "Merienda",
  activity: "Actividad",
  dumbbell: "Ejercicio",
  footprints: "Caminata",
  bike: "Bicicleta",
  "book-open": "Lectura",
  "tree-pine": "Aire libre",
  music: "Música",
  palette: "Pasatiempo",
  droplets: "Agua",
  "glass-water": "Vaso de agua",
  waves: "Hidratación",
  "calendar-clock": "Cita",
  stethoscope: "Estetoscopio",
  building: "Hospital",
  microscope: "Laboratorio",
  scan: "Estudio / imagen",
};

export const DEFAULT_CARE_ICONS = {
  medication: "pill",
  meal: "utensils-crossed",
  activity: "activity",
  hydration: "droplets",
  appointment: "calendar-clock",
  exam: "stethoscope",
} as const satisfies Record<string, CareIconKey>;

export const ICON_OPTIONS_BY_CONTEXT = {
  medication: [
    "pill",
    "tablets",
    "tablet",
    "pill-bottle",
    "syringe",
    "flask-conical",
    "droplet",
    "spray-can",
    "bandage",
  ] as CareIconKey[],
  meal: ["utensils-crossed", "coffee", "apple", "salad", "sun", "moon", "cookie"] as CareIconKey[],
  activity: [
    "activity",
    "dumbbell",
    "footprints",
    "bike",
    "book-open",
    "tree-pine",
    "music",
    "palette",
  ] as CareIconKey[],
  hydration: ["droplets", "glass-water", "waves"] as CareIconKey[],
  appointment: ["calendar-clock", "stethoscope", "heart", "building", "heart-pulse"] as CareIconKey[],
  exam: ["stethoscope", "microscope", "scan", "heart-pulse", "building"] as CareIconKey[],
} as const;

export type CareIconContext = keyof typeof ICON_OPTIONS_BY_CONTEXT;

export function resolveCareIcon(key: string | null | undefined, fallback: CareIconKey): LucideIcon {
  if (key && key in CARE_ICONS) {
    return CARE_ICONS[key as CareIconKey];
  }
  return CARE_ICONS[fallback];
}

export function normalizeCareIconKey(
  key: string | null | undefined,
  fallback: CareIconKey
): CareIconKey {
  if (key && key in CARE_ICONS) return key as CareIconKey;
  return fallback;
}

export function getDefaultIconForContext(context: CareIconContext): CareIconKey {
  if (context === "hydration") return DEFAULT_CARE_ICONS.hydration;
  if (context === "activity") return DEFAULT_CARE_ICONS.activity;
  if (context === "meal") return DEFAULT_CARE_ICONS.meal;
  if (context === "medication") return DEFAULT_CARE_ICONS.medication;
  if (context === "exam") return DEFAULT_CARE_ICONS.exam;
  return DEFAULT_CARE_ICONS.appointment;
}
