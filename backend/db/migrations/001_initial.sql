-- TourFlow AI - initial PostgreSQL schema
-- Applied automatically by db/migrate.js (on server start and with `npm run db:migrate`).

-- ---------------------------------------------------------------- users
CREATE TABLE users (
  id                  text PRIMARY KEY,                 -- e.g. USR-1A2B3C4D
  name                text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  email               text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash       text NOT NULL,                    -- scrypt:<salt>:<hash>, never plaintext
  role                text NOT NULL CHECK (role IN ('tourist', 'admin')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  password_changed_at timestamptz
);

-- ---------------------------------------------------------------- sessions
-- Only a SHA-256 hash of the session token is stored.
CREATE TABLE sessions (
  token_hash  text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  user_agent  text,
  ip          text
);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_expires_idx ON sessions (expires_at);

-- ---------------------------------------------------------------- destinations
-- `dataset` is the original record from india_tourism_dataset.json (refreshed on migrate).
-- `content` and `images` are edited by admins and never overwritten by the dataset.
CREATE TABLE destinations (
  id                     text PRIMARY KEY,
  dataset                jsonb NOT NULL,
  content                jsonb NOT NULL DEFAULT '{}'::jsonb,
  images                 jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(images) = 'array'),
  queue_open             boolean NOT NULL DEFAULT true,
  entry_rate_per_minute  numeric(5,1) NOT NULL DEFAULT 2 CHECK (entry_rate_per_minute BETWEEN 0.1 AND 100),
  max_queue_people       integer NOT NULL DEFAULT 200 CHECK (max_queue_people BETWEEN 1 AND 100000),
  notice                 text NOT NULL DEFAULT '' CHECK (char_length(notice) <= 200),
  last_ticket_number     integer NOT NULL DEFAULT 0 CHECK (last_ticket_number >= 0),
  content_updated_at     timestamptz,
  content_updated_by     text REFERENCES users(id) ON DELETE SET NULL,
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------- bookings
CREATE TABLE bookings (
  booking_id          text PRIMARY KEY,                 -- e.g. TF-1A2B3C
  user_id             text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  destination_id      text NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
  number_of_people    smallint NOT NULL CHECK (number_of_people BETWEEN 1 AND 4),
  ticket_number       integer NOT NULL CHECK (ticket_number > 0),   -- FIFO order inside a destination
  position_at_booking integer NOT NULL,
  status              text NOT NULL CHECK (status IN ('WAITING', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW')),
  request_id          text,                             -- idempotency key from the browser
  pass_code           text NOT NULL UNIQUE,             -- secret part of the QR pass
  pass_issued_at      timestamptz NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  checked_in_at       timestamptz,
  checked_out_at      timestamptz,
  cancelled_at        timestamptz,
  ended_reason        text,                             -- reason for admin cancel / no-show
  UNIQUE (destination_id, ticket_number),               -- two bookings can never share a queue number
  UNIQUE (user_id, request_id)                          -- a resubmitted request cannot create a 2nd booking
);
-- a tourist may hold only one active booking per destination
CREATE UNIQUE INDEX bookings_one_active_per_destination
  ON bookings (user_id, destination_id) WHERE status IN ('WAITING', 'CHECKED_IN');
CREATE INDEX bookings_queue_idx ON bookings (destination_id, status, ticket_number);
CREATE INDEX bookings_user_idx ON bookings (user_id, created_at DESC);

-- ---------------------------------------------------------------- audit log
-- Append-only record of important actions (admin actions, overrides, logins ...).
CREATE TABLE audit_log (
  id           bigserial PRIMARY KEY,
  at           timestamptz NOT NULL DEFAULT now(),
  actor_id     text,                                  -- plain text: the log must survive user changes
  actor_email  text,
  actor_role   text,
  action       text NOT NULL,
  target_type  text,
  target_id    text,
  reason       text,
  details      jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX audit_log_at_idx ON audit_log (at DESC);
CREATE INDEX audit_log_target_idx ON audit_log (target_type, target_id);

CREATE FUNCTION audit_log_is_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update_or_delete
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_is_append_only();
