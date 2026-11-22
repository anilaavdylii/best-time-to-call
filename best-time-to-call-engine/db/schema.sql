create table if not exists settings (
  workspace_id uuid primary key,
  timezone     text not null,
  shift_start  text not null
);

create table if not exists contacts (
  id           integer generated always as identity primary key,
  workspace_id uuid not null,
  phone        text not null,
  state        text,
  unique (workspace_id, phone)
);

create table if not exists call_attempts (
  id         integer generated always as identity primary key,
  contact_id integer not null references contacts(id) on delete cascade,
  called_at  timestamptz not null,
  local_hour integer not null check (local_hour between 0 and 23),
  outcome    text not null check (outcome in ('answered','no_answer','busy','failed')),
  positive   boolean not null default false
);