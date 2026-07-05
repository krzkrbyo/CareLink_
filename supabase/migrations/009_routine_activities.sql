-- Actividades de rutina vinculadas a recordatorios diarios

CREATE TABLE routine_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('activity', 'hydration')),
  message_text TEXT,
  scheduled_time TIME NOT NULL DEFAULT '10:00',
  days_of_week INT[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS routine_activity_id UUID REFERENCES routine_activities(id) ON DELETE CASCADE;

CREATE INDEX idx_routine_activities_elder ON routine_activities(elder_id);
CREATE INDEX idx_reminders_routine_activity ON reminders(routine_activity_id);

ALTER TABLE routine_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY routine_activities_caregiver_all ON routine_activities FOR ALL
  USING (is_caregiver_for_elder(elder_id))
  WITH CHECK (is_caregiver_for_elder(elder_id));

CREATE POLICY routine_activities_elder_select ON routine_activities FOR SELECT
  USING (is_elder_self(elder_id));
