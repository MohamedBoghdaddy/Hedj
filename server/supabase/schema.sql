-- ============================================================
-- Hedj Commerce – Supabase Postgres Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- MongoDB remains the source of truth for all business data.
-- These tables store email outbox / logs and image-asset metadata.
-- ============================================================

-- ─── Helpers ────────────────────────────────────────────────
-- Auto-update updated_at on every row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── 1. email_templates ─────────────────────────────────────
create table if not exists email_templates (
  id           uuid primary key default gen_random_uuid(),
  key          text unique not null,
  subject      text not null,
  body_html    text,
  body_text    text,
  variables    jsonb not null default '{}'::jsonb,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists email_templates_updated_at on email_templates;
create trigger email_templates_updated_at
  before update on email_templates
  for each row execute function set_updated_at();

-- ─── 2. email_outbox ────────────────────────────────────────
create table if not exists email_outbox (
  id                  uuid primary key default gen_random_uuid(),
  mongo_user_id       text,
  related_entity_type text,
  related_entity_id   text,
  to_email            text not null,
  to_name             text,
  from_email          text,
  subject             text not null,
  body_html           text,
  body_text           text,
  template_key        text,
  template_variables  jsonb not null default '{}'::jsonb,
  status              text not null default 'pending'
    check (status in ('pending','sending','sent','failed','cancelled')),
  provider            text,
  provider_message_id text,
  error_message       text,
  attempts            integer not null default 0,
  scheduled_at        timestamptz not null default now(),
  sent_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists email_outbox_updated_at on email_outbox;
create trigger email_outbox_updated_at
  before update on email_outbox
  for each row execute function set_updated_at();

create index if not exists idx_email_outbox_status   on email_outbox(status);
create index if not exists idx_email_outbox_to_email on email_outbox(to_email);

-- ─── 3. email_logs ──────────────────────────────────────────
create table if not exists email_logs (
  id         uuid primary key default gen_random_uuid(),
  outbox_id  uuid references email_outbox(id) on delete set null,
  event_type text not null,   -- created | sending | sent | failed | opened | clicked
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_logs_outbox_id on email_logs(outbox_id);

-- ─── 4. image_assets ────────────────────────────────────────
create table if not exists image_assets (
  id                  uuid primary key default gen_random_uuid(),
  mongo_owner_id      text,
  related_entity_type text,   -- user | product | employee | category | showroom
  related_entity_id   text,
  bucket              text not null,
  path                text not null,
  public_url          text,
  signed_url          text,
  file_name           text,
  mime_type           text,
  size_bytes          bigint,
  width               integer,
  height              integer,
  alt_text            text,
  status              text not null default 'active'
    check (status in ('active','archived','deleted')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists image_assets_updated_at on image_assets;
create trigger image_assets_updated_at
  before update on image_assets
  for each row execute function set_updated_at();

create index if not exists idx_image_assets_entity
  on image_assets(related_entity_type, related_entity_id);
create index if not exists idx_image_assets_bucket_path
  on image_assets(bucket, path);

-- ─── Seed: default email templates ──────────────────────────
insert into email_templates (key, subject, body_html, body_text, variables)
values
  (
    'employee_invite',
    'You have been invited to join Hedj Commerce',
    '<h2>Welcome to Hedj Commerce</h2><p>Hi {{name}},</p><p>You have been invited as a <strong>{{role}}</strong> in the <strong>{{department}}</strong> department.</p><p><a href="{{inviteUrl}}">Accept Invitation</a></p>',
    'Hi {{name}}, you have been invited to join Hedj Commerce as {{role}} in {{department}}. Accept at: {{inviteUrl}}',
    '{"name":"string","role":"string","department":"string","inviteUrl":"string"}'::jsonb
  ),
  (
    'order_confirmation',
    'Your Hedj Commerce order #{{orderId}} is confirmed',
    '<h2>Order Confirmed</h2><p>Hi {{name}},</p><p>Your order <strong>#{{orderId}}</strong> has been confirmed. Total: <strong>{{total}}</strong>.</p>',
    'Hi {{name}}, your order #{{orderId}} is confirmed. Total: {{total}}.',
    '{"name":"string","orderId":"string","total":"string"}'::jsonb
  )
on conflict (key) do nothing;
