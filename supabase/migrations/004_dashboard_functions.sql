-- RPC: get_state_stats
-- Returns total applicants and hired count per state since a given date
CREATE OR REPLACE FUNCTION get_state_stats(since timestamptz DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE (
  state_name text,
  total bigint,
  hired bigint
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    s.name AS state_name,
    COUNT(a.id) AS total,
    COUNT(a.id) FILTER (WHERE a.status IN ('hired', 'rehire')) AS hired
  FROM states s
  LEFT JOIN applicants a ON a.state_id = s.id
    AND a.application_date >= since::date
  GROUP BY s.id, s.name
  ORDER BY s.name;
$$;

-- RPC: get_monthly_applicants
-- Returns monthly count of applicants for the last 12 months
CREATE OR REPLACE FUNCTION get_monthly_applicants()
RETURNS TABLE (
  month text,
  count bigint
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    TO_CHAR(DATE_TRUNC('month', application_date), 'Mon YYYY') AS month,
    COUNT(*) AS count
  FROM applicants
  WHERE application_date >= (CURRENT_DATE - INTERVAL '12 months')
  GROUP BY DATE_TRUNC('month', application_date)
  ORDER BY DATE_TRUNC('month', application_date);
$$;
