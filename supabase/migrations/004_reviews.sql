-- ────────────────────────────────────────────────────────────────
-- 004_reviews.sql  –  Customer review submissions
-- ────────────────────────────────────────────────────────────────

-- Enum for moderation state
create type review_status as enum ('pending', 'approved', 'rejected');

create table if not exists reviews (
  id              uuid primary key default gen_random_uuid(),
  name            text        not null,
  email           text,                           -- optional, for verification
  rating          smallint    not null check (rating between 1 and 5),
  body            text        not null,
  photo_url       text,                           -- optional uploaded photo
  status          review_status not null default 'pending',
  is_verified     boolean     not null default false,
  spam_score      numeric(4,2) default 0,         -- future: honeypot / reCAPTCHA score
  admin_note      text,                           -- internal moderation note
  ip_address      text,                           -- for spam detection
  created_at      timestamptz not null default now(),
  approved_at     timestamptz,
  rejected_at     timestamptz
);

-- ── Indexes ────────────────────────────────────────────────────
create index reviews_status_idx      on reviews(status);
create index reviews_created_at_idx  on reviews(created_at desc);

-- ── Row-Level Security ─────────────────────────────────────────
alter table reviews enable row level security;

-- Public can read approved reviews only
create policy "public_read_approved_reviews"
  on reviews for select
  using (status = 'approved');

-- Anybody can insert a new (pending) review
create policy "public_insert_reviews"
  on reviews for insert
  with check (status = 'pending');

-- Only service role can update/delete (admin moderation)
-- (service role bypasses RLS automatically)

-- ── Admin helper: approve a review ────────────────────────────
create or replace function approve_review(review_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update reviews
  set
    status      = 'approved',
    approved_at = now(),
    rejected_at = null
  where id = review_id;
end;
$$;

-- ── Admin helper: reject a review ─────────────────────────────
create or replace function reject_review(review_id uuid, note text default null)
returns void
language plpgsql
security definer
as $$
begin
  update reviews
  set
    status      = 'rejected',
    rejected_at = now(),
    approved_at = null,
    admin_note  = coalesce(note, admin_note)
  where id = review_id;
end;
$$;

-- ── Admin route: queue of pending reviews ─────────────────────
create or replace view pending_reviews as
  select * from reviews where status = 'pending' order by created_at asc;

-- ── Seed: pre-approved sample reviews ─────────────────────────
insert into reviews (name, rating, body, status, is_verified, approved_at) values
  ('Marcus T.',   5, 'Best cheesesteak in Philly. Period. The rib-eye is fire and the whiz is perfect.',                                           'approved', true,  now()),
  ('Destiny W.',  5, 'The AI ordering is actually wild — called at midnight and had my order in by the time I pulled up!',                          'approved', true,  now()),
  ('James K.',    5, 'Bob''s Big Beautiful Bacon Burger is no joke. Come hungry.',                                                                  'approved', true,  now()),
  ('Keisha P.',   5, 'Came in for lunch and stayed for dessert. The banana pudding got me.',                                                        'approved', false, now()),
  ('Tony R.',     4, 'Solid spot. Long line on a Friday but worth every minute. The chicken cutlet hoagie slaps.',                                  'approved', false, now());
