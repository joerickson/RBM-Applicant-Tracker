-- Enable RLS
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper function: get current user's state IDs
CREATE OR REPLACE FUNCTION get_my_state_ids()
RETURNS uuid[]
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT state_ids FROM profiles WHERE id = auth.uid();
$$;

-- Profiles: users can read their own profile; super_admin can read all
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid() OR get_my_role() = 'super_admin');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Applicants: super_admin sees all; others see only their assigned states
CREATE POLICY "applicants_select" ON applicants
  FOR SELECT USING (
    get_my_role() = 'super_admin'
    OR state_id = ANY(get_my_state_ids())
  );

CREATE POLICY "applicants_insert" ON applicants
  FOR INSERT WITH CHECK (
    get_my_role() IN ('super_admin', 'state_admin', 'hr_rep')
    AND (get_my_role() = 'super_admin' OR state_id = ANY(get_my_state_ids()))
  );

CREATE POLICY "applicants_update" ON applicants
  FOR UPDATE USING (
    get_my_role() IN ('super_admin', 'state_admin', 'hr_rep')
    AND (get_my_role() = 'super_admin' OR state_id = ANY(get_my_state_ids()))
  );

CREATE POLICY "applicants_delete" ON applicants
  FOR DELETE USING (
    get_my_role() IN ('super_admin', 'state_admin')
    AND (get_my_role() = 'super_admin' OR state_id = ANY(get_my_state_ids()))
  );

-- Applications (portal submissions): authenticated users can read/update for their states
CREATE POLICY "applications_select" ON applications
  FOR SELECT USING (
    get_my_role() = 'super_admin'
    OR EXISTS (
      SELECT 1 FROM states s
      WHERE s.name ILIKE state_applying
      AND s.id = ANY(get_my_state_ids())
    )
  );

CREATE POLICY "applications_insert_public" ON applications
  FOR INSERT WITH CHECK (true); -- Public can submit applications

CREATE POLICY "applications_update" ON applications
  FOR UPDATE USING (
    get_my_role() IN ('super_admin', 'state_admin', 'hr_rep')
  );

-- Managers: all authenticated can read
CREATE POLICY "managers_select" ON managers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "managers_insert" ON managers
  FOR INSERT WITH CHECK (get_my_role() IN ('super_admin', 'state_admin'));

CREATE POLICY "managers_update" ON managers
  FOR UPDATE USING (get_my_role() IN ('super_admin', 'state_admin'));

-- HR Reps: all authenticated can read
CREATE POLICY "hr_reps_select" ON hr_reps
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "hr_reps_insert" ON hr_reps
  FOR INSERT WITH CHECK (get_my_role() IN ('super_admin', 'state_admin'));

CREATE POLICY "hr_reps_update" ON hr_reps
  FOR UPDATE USING (get_my_role() IN ('super_admin', 'state_admin'));

-- Dropdown options: all authenticated can read; super_admin can write
CREATE POLICY "dropdown_options_select" ON dropdown_options
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "dropdown_options_insert" ON dropdown_options
  FOR INSERT WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "dropdown_options_update" ON dropdown_options
  FOR UPDATE USING (get_my_role() = 'super_admin');

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: updated_at for applicants
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
