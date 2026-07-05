-- Horarios de comida vinculados a recordatorios diarios

CREATE TABLE meal_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (label IN ('Desayuno', 'Almuerzo', 'Merienda', 'Cena')),
  message_text TEXT,
  scheduled_time TIME NOT NULL,
  days_of_week INT[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (elder_id, label)
);

ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS meal_schedule_id UUID REFERENCES meal_schedules(id) ON DELETE CASCADE;

CREATE INDEX idx_meal_schedules_elder ON meal_schedules(elder_id);
CREATE INDEX idx_reminders_meal_schedule ON reminders(meal_schedule_id);

ALTER TABLE meal_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY meal_schedules_caregiver_all ON meal_schedules FOR ALL
  USING (is_caregiver_for_elder(elder_id))
  WITH CHECK (is_caregiver_for_elder(elder_id));

CREATE POLICY meal_schedules_elder_select ON meal_schedules FOR SELECT
  USING (is_elder_self(elder_id));
