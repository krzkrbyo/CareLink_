-- Recordatorios personales creados por el adulto mayor (vía chat de voz)

ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_type_check;
ALTER TABLE reminders ADD CONSTRAINT reminders_type_check
  CHECK (type IN (
    'medication', 'meal', 'appointment', 'exam',
    'hydration', 'activity', 'checkin', 'mood', 'personal'
  ));

ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_type_check;
ALTER TABLE interactions ADD CONSTRAINT interactions_type_check
  CHECK (type IN (
    'medication_confirmed', 'meal_confirmed', 'mood', 'checkin', 'help',
    'voice_message', 'family_notified', 'reminder_created', 'reminder_completed'
  ));

CREATE POLICY reminders_elder_insert ON reminders FOR INSERT
  WITH CHECK (
    is_elder_self(elder_id)
    AND type = 'personal'
  );
