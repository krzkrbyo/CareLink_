-- Auth + RLS production policies for CareLink

ALTER TABLE elders ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop demo open-read policies
DROP POLICY IF EXISTS demo_select_elders ON elders;
DROP POLICY IF EXISTS demo_select_profiles ON profiles;
DROP POLICY IF EXISTS demo_select_links ON caregiver_elder_links;
DROP POLICY IF EXISTS demo_select_medications ON medications;
DROP POLICY IF EXISTS demo_select_appointments ON appointments;
DROP POLICY IF EXISTS demo_select_food_rules ON food_rules;
DROP POLICY IF EXISTS demo_select_reminders ON reminders;
DROP POLICY IF EXISTS demo_select_interactions ON interactions;
DROP POLICY IF EXISTS demo_select_alerts ON alerts;

-- Helper functions (security definer for RLS checks)
CREATE OR REPLACE FUNCTION public.is_caregiver_for_elder(e_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM caregiver_elder_links
    WHERE elder_id = e_id AND caregiver_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_elder_self(e_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM elders WHERE id = e_id AND auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.my_elder_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM elders WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- Profiles
CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (id = auth.uid());
CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Elders
CREATE POLICY elders_caregiver_select ON elders FOR SELECT
  USING (is_caregiver_for_elder(id) OR auth_user_id = auth.uid());
CREATE POLICY elders_caregiver_insert ON elders FOR INSERT
  WITH CHECK (true);
CREATE POLICY elders_caregiver_update ON elders FOR UPDATE
  USING (is_caregiver_for_elder(id) OR auth_user_id = auth.uid());
CREATE POLICY elders_caregiver_delete ON elders FOR DELETE
  USING (is_caregiver_for_elder(id));

-- Caregiver-elder links
CREATE POLICY links_caregiver_select ON caregiver_elder_links FOR SELECT
  USING (caregiver_id = auth.uid() OR is_elder_self(elder_id));
CREATE POLICY links_caregiver_insert ON caregiver_elder_links FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());
CREATE POLICY links_caregiver_delete ON caregiver_elder_links FOR DELETE
  USING (caregiver_id = auth.uid());

-- Medications
CREATE POLICY medications_caregiver_all ON medications FOR ALL
  USING (is_caregiver_for_elder(elder_id))
  WITH CHECK (is_caregiver_for_elder(elder_id));
CREATE POLICY medications_elder_select ON medications FOR SELECT
  USING (is_elder_self(elder_id));

-- Appointments
CREATE POLICY appointments_caregiver_all ON appointments FOR ALL
  USING (is_caregiver_for_elder(elder_id))
  WITH CHECK (is_caregiver_for_elder(elder_id));
CREATE POLICY appointments_elder_select ON appointments FOR SELECT
  USING (is_elder_self(elder_id));

-- Food rules
CREATE POLICY food_rules_caregiver_all ON food_rules FOR ALL
  USING (is_caregiver_for_elder(elder_id))
  WITH CHECK (is_caregiver_for_elder(elder_id));
CREATE POLICY food_rules_elder_select ON food_rules FOR SELECT
  USING (is_elder_self(elder_id));

-- Reminders
CREATE POLICY reminders_caregiver_all ON reminders FOR ALL
  USING (is_caregiver_for_elder(elder_id))
  WITH CHECK (is_caregiver_for_elder(elder_id));
CREATE POLICY reminders_elder_select ON reminders FOR SELECT
  USING (is_elder_self(elder_id));
CREATE POLICY reminders_elder_update ON reminders FOR UPDATE
  USING (is_elder_self(elder_id));

-- Interactions
CREATE POLICY interactions_select ON interactions FOR SELECT
  USING (is_caregiver_for_elder(elder_id) OR is_elder_self(elder_id));
CREATE POLICY interactions_elder_insert ON interactions FOR INSERT
  WITH CHECK (is_elder_self(elder_id));
CREATE POLICY interactions_caregiver_insert ON interactions FOR INSERT
  WITH CHECK (is_caregiver_for_elder(elder_id));

-- Alerts
CREATE POLICY alerts_select ON alerts FOR SELECT
  USING (is_caregiver_for_elder(elder_id) OR is_elder_self(elder_id));
CREATE POLICY alerts_elder_insert ON alerts FOR INSERT
  WITH CHECK (is_elder_self(elder_id));
CREATE POLICY alerts_caregiver_update ON alerts FOR UPDATE
  USING (is_caregiver_for_elder(elder_id));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'caregiver')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
