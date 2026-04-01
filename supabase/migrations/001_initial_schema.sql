-- =============================================================
-- RBM Applicant Tracker - Initial Schema Migration
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLES
-- =============================================================

-- States table
CREATE TABLE IF NOT EXISTS states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dropdown options for configurable select fields
CREATE TABLE IF NOT EXISTS dropdown_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,          -- 'status', 'document_type', 'referral_source'
  value TEXT NOT NULL,             -- internal value key
  label_en TEXT NOT NULL,          -- English display label
  label_es TEXT NOT NULL DEFAULT '',  -- Spanish display label
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, value)
);

-- Managers
CREATE TABLE IF NOT EXISTS managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HR Representatives
CREATE TABLE IF NOT EXISTS hr_reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  email TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',   -- 'admin', 'manager', 'hr', 'viewer'
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applicants (main tracker data)
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'applied',
  manager_id UUID REFERENCES managers(id) ON DELETE SET NULL,
  hr_rep_id UUID REFERENCES hr_reps(id) ON DELETE SET NULL,
  referral_source TEXT,
  application_date DATE,
  start_date DATE,
  document_type TEXT,
  document_expiration DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public portal applications (submitted via /apply)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  document_type TEXT,
  document_number TEXT,
  document_expiration DATE,
  work_authorized BOOLEAN NOT NULL DEFAULT false,
  position TEXT,
  state_id UUID REFERENCES states(id) ON DELETE SET NULL,
  referral_source TEXT,
  referred_by TEXT,
  available_date DATE,
  notes TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'portal_submitted',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  converted_to_applicant_id UUID REFERENCES applicants(id) ON DELETE SET NULL
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_applicants_state_id ON applicants(state_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_manager_id ON applicants(manager_id);
CREATE INDEX IF NOT EXISTS idx_applicants_hr_rep_id ON applicants(hr_rep_id);
CREATE INDEX IF NOT EXISTS idx_applicants_application_date ON applicants(application_date);
CREATE INDEX IF NOT EXISTS idx_applicants_document_expiration ON applicants(document_expiration);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_dropdown_options_category ON dropdown_options(category);
CREATE INDEX IF NOT EXISTS idx_managers_state_id ON managers(state_id);
CREATE INDEX IF NOT EXISTS idx_hr_reps_state_id ON hr_reps(state_id);

-- =============================================================
-- UPDATED_AT TRIGGER
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applicants_updated_at
  BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- States: public read, admin write
CREATE POLICY "states_public_read" ON states
  FOR SELECT USING (true);

CREATE POLICY "states_admin_write" ON states
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Dropdown options: public read (needed for /apply page), admin write
CREATE POLICY "dropdown_options_public_read" ON dropdown_options
  FOR SELECT USING (true);

CREATE POLICY "dropdown_options_admin_write" ON dropdown_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin')
    )
  );

-- Managers: authenticated read, admin write
CREATE POLICY "managers_authenticated_read" ON managers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "managers_admin_write" ON managers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr')
    )
  );

-- HR Reps: authenticated read, admin write
CREATE POLICY "hr_reps_authenticated_read" ON hr_reps
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "hr_reps_admin_write" ON hr_reps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr')
    )
  );

-- Profiles: users can read their own, admins can read all
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Applicants: authenticated users can read all; admins and HR can write all;
-- managers can only write applicants in their state
CREATE POLICY "applicants_authenticated_read" ON applicants
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "applicants_admin_hr_write" ON applicants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr')
    )
  );

CREATE POLICY "applicants_manager_write" ON applicants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.state_id = applicants.state_id
    )
  );

-- Applications (portal submissions): public can insert, authenticated can read/update
CREATE POLICY "applications_public_insert" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "applications_authenticated_read" ON applications
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "applications_admin_hr_update" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'hr')
    )
  );

-- =============================================================
-- SEED DATA
-- =============================================================

-- States
INSERT INTO states (id, name, abbreviation) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Utah', 'UT'),
  ('10000000-0000-0000-0000-000000000002', 'Nevada', 'NV'),
  ('10000000-0000-0000-0000-000000000003', 'Arizona', 'AZ'),
  ('10000000-0000-0000-0000-000000000004', 'Texas', 'TX')
ON CONFLICT (abbreviation) DO NOTHING;

-- Dropdown options: Status
INSERT INTO dropdown_options (category, value, label_en, label_es, sort_order) VALUES
  ('status', 'applied', 'Applied', 'Aplicado', 1),
  ('status', 'screening', 'Screening', 'En Selección', 2),
  ('status', 'interview', 'Interview', 'Entrevista', 3),
  ('status', 'offer', 'Offer', 'Oferta', 4),
  ('status', 'hired', 'Hired', 'Contratado', 5),
  ('status', 'rejected', 'Rejected', 'Rechazado', 6),
  ('status', 'withdrawn', 'Withdrawn', 'Retirado', 7),
  ('status', 'in_process', 'In Process', 'En Proceso', 8),
  ('status', 'pending_docs', 'Pending Docs', 'Docs Pendientes', 9),
  ('status', 'portal_submitted', 'Portal Submitted', 'Enviado por Portal', 10)
ON CONFLICT (category, value) DO NOTHING;

-- Dropdown options: Document Type
INSERT INTO dropdown_options (category, value, label_en, label_es, sort_order) VALUES
  ('document_type', 'ssn', 'Social Security Card', 'Tarjeta de Seguro Social', 1),
  ('document_type', 'ead', 'Employment Authorization Document (EAD)', 'Documento de Autorización de Empleo (EAD)', 2),
  ('document_type', 'greencard', 'Permanent Resident Card (Green Card)', 'Tarjeta de Residente Permanente (Green Card)', 3),
  ('document_type', 'passport', 'US Passport', 'Pasaporte Americano', 4),
  ('document_type', 'visa', 'Work Visa', 'Visa de Trabajo', 5),
  ('document_type', 'dl', 'Driver''s License', 'Licencia de Conducir', 6),
  ('document_type', 'other', 'Other', 'Otro', 7)
ON CONFLICT (category, value) DO NOTHING;

-- Dropdown options: Referral Source
INSERT INTO dropdown_options (category, value, label_en, label_es, sort_order) VALUES
  ('referral_source', 'friend', 'Friend / Referral', 'Amigo / Referido', 1),
  ('referral_source', 'facebook', 'Facebook', 'Facebook', 2),
  ('referral_source', 'indeed', 'Indeed', 'Indeed', 3),
  ('referral_source', 'craigslist', 'Craigslist', 'Craigslist', 4),
  ('referral_source', 'sign', 'Road Sign', 'Letrero en la Calle', 5),
  ('referral_source', 'door_hanger', 'Door Hanger', 'Volante en Puerta', 6),
  ('referral_source', 'nextdoor', 'Nextdoor', 'Nextdoor', 7),
  ('referral_source', 'google', 'Google', 'Google', 8),
  ('referral_source', 'other', 'Other', 'Otro', 9)
ON CONFLICT (category, value) DO NOTHING;

-- Managers (one per state as initial seed)
INSERT INTO managers (id, name, state_id, email) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Mike Johnson', '10000000-0000-0000-0000-000000000001', 'mike.johnson@rbm.com'),
  ('20000000-0000-0000-0000-000000000002', 'Sarah Williams', '10000000-0000-0000-0000-000000000002', 'sarah.williams@rbm.com'),
  ('20000000-0000-0000-0000-000000000003', 'Carlos Ramirez', '10000000-0000-0000-0000-000000000003', 'carlos.ramirez@rbm.com'),
  ('20000000-0000-0000-0000-000000000004', 'Jennifer Davis', '10000000-0000-0000-0000-000000000004', 'jennifer.davis@rbm.com'),
  ('20000000-0000-0000-0000-000000000005', 'Tom Anderson', '10000000-0000-0000-0000-000000000001', 'tom.anderson@rbm.com'),
  ('20000000-0000-0000-0000-000000000006', 'Lisa Martinez', '10000000-0000-0000-0000-000000000002', 'lisa.martinez@rbm.com')
ON CONFLICT DO NOTHING;

-- HR Representatives (one per state as initial seed)
INSERT INTO hr_reps (id, name, state_id, email) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Amanda Chen', '10000000-0000-0000-0000-000000000001', 'amanda.chen@rbm.com'),
  ('30000000-0000-0000-0000-000000000002', 'Robert Kim', '10000000-0000-0000-0000-000000000002', 'robert.kim@rbm.com'),
  ('30000000-0000-0000-0000-000000000003', 'Maria Lopez', '10000000-0000-0000-0000-000000000003', 'maria.lopez@rbm.com'),
  ('30000000-0000-0000-0000-000000000004', 'David Thompson', '10000000-0000-0000-0000-000000000004', 'david.thompson@rbm.com')
ON CONFLICT DO NOTHING;

-- =============================================================
-- FUNCTION: auto-create profile on user signup
-- =============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'viewer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
