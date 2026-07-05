-- Íconos personalizables por registro de cuidado

ALTER TABLE medications ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE meal_schedules ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE routine_activities ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS icon TEXT;

COMMENT ON COLUMN medications.icon IS 'Clave de ícono Lucide (lib/icons/registry.ts)';
COMMENT ON COLUMN meal_schedules.icon IS 'Clave de ícono Lucide (lib/icons/registry.ts)';
COMMENT ON COLUMN routine_activities.icon IS 'Clave de ícono Lucide (lib/icons/registry.ts)';
COMMENT ON COLUMN appointments.icon IS 'Clave de ícono Lucide (lib/icons/registry.ts)';
