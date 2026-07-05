# CareLink

Plataforma funcional de acompañamiento para adultos mayores con autenticación, CRUD completo y alertas en tiempo real.

## Requisitos

- Node.js 20+
- Proyecto Supabase configurado
- `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (requerido para reset demo y n8n)

## Setup

```bash
cp .env.example .env.local
# Completar SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

## Inicializar demo Don Manuel & Ana

Con el servidor corriendo y service role configurado:

```bash
curl -X POST http://localhost:3000/api/demo/reset
```

Credenciales demo:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Cuidador (Ana) | ana@carelink.app | CareLink2026! |
| Adulto mayor (Don Manuel) | manuel@carelink.app | CareLink2026! |

## Funcionalidades

- **Login / registro** con Supabase Auth (roles: cuidador o adulto mayor)
- **Portal cuidador** con sidebar responsive (móvil + escritorio)
- **CRUD** de medicamentos, citas/exámenes y reglas alimenticias
- **Alta de personas** desde el portal cuidador con correo y contraseña para el portal del adulto mayor
- **Dashboard en vivo** con Realtime + polling
- **Alertas** generadas por acciones del adulto mayor + resolución desde dashboard
- **Portal adulto mayor** con botones accesibles
- **Exportación .ics** de citas
- **OpenAI / ElevenLabs** con fallbacks

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Iniciar sesión |
| `/signup` | Crear cuenta |
| `/cuidador` | Lista de personas a cargo |
| `/cuidador/resumen` | Panel general con métricas de todas las personas |
| `/cuidador/[elderId]/dashboard` | Dashboard individual con gráficas |
| `/cuidador/[elderId]/configuracion` | CRUD |
| `/adulto` | Portal adulto mayor |

## Seguridad

- RLS activo en todas las tablas
- Cuidadores solo ven/editan personas vinculadas
- Adultos mayores solo insertan sus propias interacciones
- Service role reservado para n8n y reset demo
