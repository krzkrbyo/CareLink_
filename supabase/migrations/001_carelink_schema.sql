-- CareLink MVP Schema
-- profiles, elders, caregiver_elder_links, medications, appointments,
-- food_rules, reminders, interactions, alerts

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('caregiver', 'elder')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE elders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INT,
  main_caregiver_name TEXT,
  emergency_contact TEXT,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  mood_today TEXT DEFAULT 'Bien',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE caregiver_elder_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (caregiver_id, elder_id)
);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT,
  time TEXT,
  scheduled_time TIME,
  frequency TEXT DEFAULT 'daily',
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cita', 'examen')),
  starts_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  calendar_export_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE food_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('allergen', 'prohibited', 'reduce', 'recommendation')),
  label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('medication', 'meal', 'appointment', 'exam', 'hydration', 'activity', 'checkin', 'mood')),
  title TEXT NOT NULL,
  message_text TEXT,
  caregiver_message_text TEXT,
  audio_url TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('medication_confirmed', 'meal_confirmed', 'mood', 'checkin', 'help', 'voice_message', 'family_notified')),
  value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elder_id UUID NOT NULL REFERENCES elders(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  type TEXT NOT NULL CHECK (type IN ('missed_medication', 'help_requested', 'inactivity', 'mood', 'appointment', 'exam', 'meal', 'checkin')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reminders_elder_status_due ON reminders(elder_id, status, due_at);
CREATE INDEX idx_interactions_elder_created ON interactions(elder_id, created_at DESC);
CREATE INDEX idx_alerts_elder_status_created ON alerts(elder_id, status, created_at DESC);
CREATE INDEX idx_medications_elder ON medications(elder_id);
CREATE INDEX idx_appointments_elder ON appointments(elder_id);
CREATE INDEX idx_food_rules_elder ON food_rules(elder_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elders ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_elder_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Demo policies: anon can read demo elder data only
CREATE POLICY demo_select_elders ON elders FOR SELECT USING (true);
CREATE POLICY demo_select_profiles ON profiles FOR SELECT USING (true);
CREATE POLICY demo_select_links ON caregiver_elder_links FOR SELECT USING (true);
CREATE POLICY demo_select_medications ON medications FOR SELECT USING (true);
CREATE POLICY demo_select_appointments ON appointments FOR SELECT USING (true);
CREATE POLICY demo_select_food_rules ON food_rules FOR SELECT USING (true);
CREATE POLICY demo_select_reminders ON reminders FOR SELECT USING (true);
CREATE POLICY demo_select_interactions ON interactions FOR SELECT USING (true);
CREATE POLICY demo_select_alerts ON alerts FOR SELECT USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE elders;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('carelink-audios', 'carelink-audios', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read audios" ON storage.objects FOR SELECT USING (bucket_id = 'carelink-audios');
