-- Seed dropdown_options

-- Document Types (all states, state_id = NULL)
INSERT INTO dropdown_options (category, value, label_en, label_es, display_order) VALUES
('document_type', 'us_citizen',               'US Citizen',               'Ciudadano Estadounidense', 1),
('document_type', 'permanent_resident',       'Permanent Resident',       'Residente Permanente',     2),
('document_type', 'employment_authorization', 'Employment Authorization', 'Autorización de Empleo',   3);

-- Applicant Statuses (all states)
INSERT INTO dropdown_options (category, value, label_en, label_es, display_order) VALUES
('status', 'hired',      'Hired',               'Contratado',               1),
('status', 'rehire',     'Re-hire',             'Recontratado',             2),
('status', 'record',     'Record',              'Registro',                 3),
('status', 'on_process', 'On Process Still',    'En Proceso',               4),
('status', 'declined',   'Declined Position',   'Rechazó el Puesto',        5),
('status', 'ssn',        'SSN',                 'SSN',                      6),
('status', 'c11',        'C11',                 'C11',                      7),
('status', 'ids',        'ID''s',               'ID''s',                    8),
('status', 'other',      'Other',               'Otro',                     9),
('status', 'minor',      'Minor Candidate',     'Candidato Menor de Edad',  10),
('status', 'transfer',   'Transfer',            'Transferido',              11);

-- Referral Sources (all states)
INSERT INTO dropdown_options (category, value, label_en, label_es, display_order) VALUES
('referral_source', 'referral',    'Referral',         'Referido',               1),
('referral_source', 'walk_in',     'Walk In',          'Sin Cita',               2),
('referral_source', 'indeed',      'Indeed',           'Indeed',                 3),
('referral_source', 'qr_code',     'QR Code',          'Código QR',              4),
('referral_source', 'rbm_website', 'RBM Website',      'Sitio Web RBM',          5),
('referral_source', 'lds_website', 'LDS Website',      'Sitio Web LDS',          6),
('referral_source', 'phone_call',  'Phone Call',       'Llamada Telefónica',     7),
('referral_source', 'job_fair',    'Job Fair',         'Feria de Empleo',        8),
('referral_source', 'facebook',    'Facebook',         'Facebook',               9);

-- Managers — Utah base list
WITH utah AS (SELECT id FROM states WHERE name = 'Utah'),
     nevada AS (SELECT id FROM states WHERE name = 'Nevada'),
     arizona AS (SELECT id FROM states WHERE name = 'Arizona'),
     texas AS (SELECT id FROM states WHERE name = 'Texas')

INSERT INTO managers (state_id, full_name)
SELECT utah.id, name FROM utah, (VALUES
  ('Angelica Lopez'), ('Armando Guereca'), ('Cole Evans'), ('Edagar Oliva'),
  ('Humberto Hernandez'), ('John Serra'), ('Jose Guevara'), ('Josh Croll'),
  ('Kelly Smart'), ('Luis Pulido'), ('Nagdaly Romero'), ('Nallely Ruelas'),
  ('Nora Sandoval'), ('Rosa Lara'), ('Salvadro Garcia'), ('Scott Evans'),
  ('Vianey Jaquez'), ('Mike Munoz'), ('Jose Frutos')
) AS t(name)

UNION ALL

SELECT nevada.id, name FROM nevada, (VALUES
  ('Angelica Lopez'), ('Armando Guereca'), ('Cole Evans'), ('Edagar Oliva'),
  ('Humberto Hernandez'), ('John Serra'), ('Jose Guevara'), ('Josh Croll'),
  ('Kelly Smart'), ('Luis Pulido'), ('Nagdaly Romero'), ('Nallely Ruelas'),
  ('Nora Sandoval'), ('Rosa Lara'), ('Salvadro Garcia'), ('Scott Evans'),
  ('Vianey Jaquez'), ('Mike Munoz'), ('Jose Frutos'),
  ('Jose Martinez'), ('Gilbert Ramirez')
) AS t(name)

UNION ALL

SELECT arizona.id, name FROM arizona, (VALUES
  ('Angelica Lopez'), ('Armando Guereca'), ('Cole Evans'), ('Edagar Oliva'),
  ('Humberto Hernandez'), ('John Serra'), ('Jose Guevara'), ('Josh Croll'),
  ('Kelly Smart'), ('Luis Pulido'), ('Nagdaly Romero'), ('Nallely Ruelas'),
  ('Nora Sandoval'), ('Rosa Lara'), ('Salvadro Garcia'), ('Scott Evans'),
  ('Vianey Jaquez'), ('Mike Munoz'), ('Jose Frutos'),
  ('Manuel Vivas'), ('Gaby Lopez'), ('Edgar')
) AS t(name)

UNION ALL

SELECT texas.id, name FROM texas, (VALUES
  ('Angelica Lopez'), ('Armando Guereca'), ('Cole Evans'), ('Edagar Oliva'),
  ('Humberto Hernandez'), ('John Serra'), ('Jose Guevara'), ('Josh Croll'),
  ('Kelly Smart'), ('Luis Pulido'), ('Nagdaly Romero'), ('Nallely Ruelas'),
  ('Nora Sandoval'), ('Rosa Lara'), ('Salvadro Garcia'), ('Scott Evans'),
  ('Vianey Jaquez'), ('Mike Munoz'), ('Jose Frutos'),
  ('Elaine Hammet'), ('Tatiana Torres')
) AS t(name);

-- HR Reps
WITH utah AS (SELECT id FROM states WHERE name = 'Utah'),
     nevada AS (SELECT id FROM states WHERE name = 'Nevada'),
     arizona AS (SELECT id FROM states WHERE name = 'Arizona'),
     texas AS (SELECT id FROM states WHERE name = 'Texas')

INSERT INTO hr_reps (state_id, full_name)
SELECT utah.id, name FROM utah, (VALUES
  ('Carolina Lopez'), ('Diana Rojas'), ('Evelyn Padron'), ('Jaqueline Calvo'),
  ('Katherine Pineda'), ('Martha Camez'), ('Monica Nevenner'), ('Araceli Uribe')
) AS t(name)

UNION ALL

SELECT nevada.id, name FROM nevada, (VALUES
  ('Carolina Lopez'), ('Diana Rojas'), ('Evelyn Padron'), ('Jaqueline Calvo'),
  ('Katherine Pineda'), ('Martha Camez'), ('Monica Nevenner'), ('Anna Tamayo')
) AS t(name)

UNION ALL

SELECT arizona.id, name FROM arizona, (VALUES
  ('Carolina Lopez'), ('Diana Rojas'), ('Evelyn Padron'), ('Jaqueline Calvo'),
  ('Katherine Pineda'), ('Martha Camez'), ('Monica Nevenner'), ('Giovana Goncalves')
) AS t(name)

UNION ALL

SELECT texas.id, name FROM texas, (VALUES
  ('Carolina Lopez'), ('Diana Rojas'), ('Evelyn Padron'), ('Jaqueline Calvo'),
  ('Katherine Pineda'), ('Martha Camez'), ('Monica Nevenner')
) AS t(name);
