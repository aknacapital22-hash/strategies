-- AKNA Capital Stock Strategies: database schema. Safe to run again (everything is "if not exists").

create table if not exists users (
  id       uuid primary key,
  name     text not null,
  email    text not null,                 -- stored lower case
  phone    text,                          -- 10 digit Indian mobile
  salt     text not null,                 -- scrypt salt and hash: the password itself is never stored
  hash     text not null,
  role     text not null default 'user' check (role in ('user', 'admin')),
  created  timestamptz not null default now(),
  constraint users_email_key unique (email),
  constraint users_phone_key unique (phone)
);

-- One row per basket a user has paid for. It is active while expires is in the future.
create table if not exists subscriptions (
  user_id  uuid not null references users (id) on delete cascade,
  slug     text not null,
  expires  timestamptz not null,
  primary key (user_id, slug)
);

-- Manual UPI payment requests, decided by an admin.
create table if not exists requests (
  id         uuid primary key,
  user_id    uuid not null references users (id) on delete cascade,
  slug       text not null,
  plan       text not null check (plan in ('quarter', 'year')),
  amount     integer not null check (amount >= 0),
  status     text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  utr        text,
  note       text,
  created    timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid
);
-- One open request per user and basket, and a payment reference can only back one request.
create unique index if not exists requests_one_open on requests (user_id, slug) where status = 'pending';
create unique index if not exists requests_utr_key on requests (utr) where utr is not null;
create index if not exists requests_user_created on requests (user_id, created desc);
create index if not exists requests_created on requests (created desc);

-- Single-use password reset links (only a hash of the token is stored).
create table if not exists password_resets (
  token_hash text primary key,
  user_id    uuid not null references users (id) on delete cascade,
  expires    timestamptz not null
);
create index if not exists password_resets_user on password_resets (user_id);

-- Emailed one-time codes: pending sign-ups and password resets. Only hashes of the ticket, code and password are kept.
create table if not exists email_codes (
  ticket_hash text primary key,
  purpose     text not null check (purpose in ('signup', 'reset')),
  email       text not null,
  salt        text not null,
  code_hash   text not null,
  attempts    integer not null default 0,
  data        jsonb not null,
  expires     timestamptz not null
);

-- Counters behind the limits on emailed codes and log-in attempts. Keys are hashed.
create table if not exists rate_limits (
  key      text primary key,
  n        integer not null,
  reset_at timestamptz not null
);

-- Stands in for email during local development, when no mail key is set.
create table if not exists demo_inbox (
  id        bigint generated always as identity primary key,
  recipient text not null,
  subject   text not null,
  link      text not null,
  at        timestamptz not null default now()
);
