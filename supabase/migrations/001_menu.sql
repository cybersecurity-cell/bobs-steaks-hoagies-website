-- ============================================================
-- 001_menu.sql
-- menu_items table for Bob's Steaks & Hoagies
-- Must run before 002_orders.sql
-- ============================================================

-- ── menu_items ───────────────────────────────────────────────
create table if not exists public.menu_items (
  id               text          primary key,
  name             text          not null,
  category         text          not null
                     check (category in ('steaks','chicken','burgers','seafood','sides','wings')),
  description      text          not null default '',
  price            numeric(10,2) not null check (price > 0),
  sizes            jsonb         not null default '[]',        -- [{label, price_delta}]
  customizations   jsonb         not null default '[]',        -- [{name, options:[]}]
  is_available     boolean       not null default true,
  is_popular       boolean       not null default false,
  tags             text[]        not null default '{}',
  image_url        text,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists menu_items_category_idx     on public.menu_items (category);
create index if not exists menu_items_is_available_idx on public.menu_items (is_available);

-- ── Auto-update updated_at ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
alter table public.menu_items enable row level security;

-- Anyone can read available items (menu page, order page, chatbot)
create policy "public_read_available_menu"
  on public.menu_items for select
  using (is_available = true);

-- Only service role can insert / update / delete (admin or Clover sync)
-- Service role bypasses RLS automatically — no explicit policy needed.

-- ── Seed data — matches src/lib/menu-data.ts exactly ─────────
insert into public.menu_items
  (id, name, category, description, price, is_popular, tags, image_url)
values

  -- PHILLY STEAKS
  (
    'plain-steak', 'Plain Steak', 'steaks',
    '100% grass-fed rib-eye steak, thinly sliced and grilled to perfection on a fresh Amoroso roll.',
    15.50, false, '{}',
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'cheese-steak', 'Cheese Steak', 'steaks',
    'Our signature rib-eye steak loaded with your choice of Cheez Whiz, provolone, or American on a toasted Amoroso roll.',
    15.88, true, array['Most Popular','Philly Classic'],
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'mushroom-cheese-steak', 'Mushroom Cheese Steak', 'steaks',
    'Rib-eye steak with sautéed mushrooms, grilled onions, and melted cheese on an Amoroso roll.',
    16.88, false, '{}',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'cheese-steak-hoagie', 'Cheese Steak Hoagie', 'steaks',
    'The best of both worlds — rib-eye steak and cheese piled high on a long hoagie roll with fresh lettuce, tomato, and onion.',
    17.00, true, array['Fan Favorite'],
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'pizza-steak', 'Pizza Steak', 'steaks',
    'Rib-eye steak topped with marinara sauce and melted provolone cheese on a toasted roll.',
    17.00, false, '{}',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80'
  ),

  -- CHICKEN
  (
    'chicken-steak', 'Chicken Steak', 'chicken',
    'Tender grilled chicken breast, thinly sliced and served on a fresh Amoroso roll.',
    15.50, false, '{}',
    'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'chicken-cheese-steak', 'Chicken Cheese Steak', 'chicken',
    'Juicy grilled chicken with your choice of Cheez Whiz, provolone, or American cheese on an Amoroso roll.',
    15.88, true, '{}',
    'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'mushroom-chicken-cheese-steak', 'Mushroom Chicken Cheese Steak', 'chicken',
    'Grilled chicken, sautéed mushrooms, and melted cheese on a toasted roll.',
    16.88, false, '{}',
    'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'chicken-parm-steak', 'Chicken Parm Steak', 'chicken',
    'Grilled chicken smothered in marinara sauce and provolone cheese, served on a toasted roll.',
    17.00, false, '{}',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'buffalo-chicken-cheese-steak', 'Buffalo Chicken Cheese Steak', 'chicken',
    'Spicy Buffalo chicken tossed in tangy hot sauce, topped with cheese and served with a side of ranch.',
    16.88, false, array['Spicy'],
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80'
  ),

  -- BURGERS
  (
    'cheese-burger', 'Cheese Burger', 'burgers',
    'Juicy hand-formed beef patty with American cheese, lettuce, tomato, and onion on a toasted brioche bun.',
    8.50, false, '{}',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'pizza-burger', 'Pizza Burger', 'burgers',
    'Beef patty topped with marinara sauce and melted provolone on a toasted bun.',
    9.50, false, '{}',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'mushroom-cheese-burger', 'Mushroom Cheese Burger', 'burgers',
    'Beef patty with sautéed mushrooms, Swiss cheese, and caramelized onions on a brioche bun.',
    8.75, false, '{}',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'bobs-big-burger', 'Bob''s Big Beautiful Bacon Burger', 'burgers',
    'Our signature double-stacked beef patty with crispy bacon, cheddar, lettuce, tomato, pickles, and Bob''s special sauce.',
    12.00, true, array['Signature','Must Try'],
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80'
  ),

  -- SEAFOOD
  (
    'fried-shrimp-platter', 'Fried Shrimp Platter', 'seafood',
    'Golden fried jumbo shrimp served with cocktail sauce, coleslaw, and your choice of side.',
    12.00, false, '{}',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'catfish-hoagie', 'Catfish Hoagie', 'seafood',
    'Crispy Southern-style fried catfish on a hoagie roll with lettuce, tomato, and tartar sauce.',
    18.50, false, '{}',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80'
  ),

  -- SIDES
  (
    'french-fries', 'French Fries', 'sides',
    'Crispy golden fries seasoned with our house blend of spices.',
    5.00, false, '{}',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'cheese-fries', 'Cheese Fries', 'sides',
    'Golden fries smothered in warm Cheez Whiz or your choice of cheese.',
    7.00, true, '{}',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'
  ),

  -- WINGS
  (
    'wings-16', '16 Wings', 'wings',
    'Crispy chicken wings tossed in your choice of sauce: Buffalo, BBQ, Honey Garlic, or Plain. Served with celery and your choice of dipping sauce.',
    19.60, true, array['Great for Sharing'],
    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&auto=format&fit=crop&q=80'
  )

on conflict (id) do update set
  name         = excluded.name,
  category     = excluded.category,
  description  = excluded.description,
  price        = excluded.price,
  is_popular   = excluded.is_popular,
  tags         = excluded.tags,
  image_url    = excluded.image_url,
  updated_at   = now();
