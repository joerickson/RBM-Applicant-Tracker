-- States
CREATE TABLE states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

INSERT INTO states (name) VALUES ('Utah'), ('Nevada'), ('Arizona'), ('Texas');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'hr_rep', -- 'super_admin' | 'state_admin' | 'hr_rep' | 'read_only'
  state_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applicants
CREATE TABLE applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid REFERENCES states(id) NOT NULL,
  application_date date NOT NULL,
  full_name text NOT NULL,
  document_type text NOT NULL,
  document_expiration_date date,
  country_of_origin text,
  status text NOT NULL,
  referral_source text,
  manager text,
  hr_rep text,
  notes text,
  source text DEFAULT 'manual',
  portal_application_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Public portal applications
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  state_applying text NOT NULL,
  document_type text NOT NULL,
  document_expiration_date date,
  country_of_origin text,
  referral_source text,
  referral_name text,
  position_interest text,
  available_start_date date,
  authorized_to_work boolean NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  language text DEFAULT 'en',
  reviewed boolean DEFAULT false,
  converted_to_applicant boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now()
);

-- Dropdown options (admin-managed)
CREATE TABLE dropdown_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  state_id uuid REFERENCES states(id),
  value text NOT NULL,
  label_en text NOT NULL,
  label_es text NOT NULL,
  display_order int DEFAULT 0,
  active boolean DEFAULT true
);

-- Managers per state
CREATE TABLE managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid REFERENCES states(id) NOT NULL,
  full_name text NOT NULL,
  active boolean DEFAULT true
);

-- HR reps per state
CREATE TABLE hr_reps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid REFERENCES states(id) NOT NULL,
  full_name text NOT NULL,
  email text,
  active boolean DEFAULT true
);

-- Add FK from applicants to applications
ALTER TABLE applicants
  ADD CONSTRAINT applicants_portal_application_id_fkey
  FOREIGN KEY (portal_application_id) REFERENCES applications(id);
