DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'processor_type') THEN
    CREATE TYPE processor_type AS ENUM ('default', 'fallback');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  correlation_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  processor processor_type NOT NULL
);
