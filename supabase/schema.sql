-- ============================================================================
-- MASTER ECOMMERCE TEMPLATE — CORE SCHEMA
-- Refurbished Electronics Store (laptops/phones/tablets/monitors/parts)
--
-- DESIGN PRINCIPLE: every visual/text/business detail lives in a DB row that
-- the admin panel edits. There should be ZERO hardcoded copy, color, image,
-- or layout choice anywhere in the frontend code. If you catch yourself
-- typing a string like "Contact us" into a .tsx file, it belongs in
-- `site_settings` or `site_content` instead.
--
-- MULTI-TENANCY MODEL: this schema is single-tenant per Supabase project.
-- To spin up store #2, you duplicate the whole project (new Supabase +
-- new Vercel + new repo clone) rather than adding a tenant_id column.
-- Rationale: real isolation (no risk of cross-store data leaks, no noisy-
-- neighbor perf issues, independent billing/scaling), and it matches how
-- you described usage ("duplicate the project"). A true shared-DB
-- multi-tenant model is a different, much more complex architecture
-- (tenant_id on every table + tenant-scoped RLS everywhere) — see
-- docs/MULTI_TENANT_ALTERNATIVE.md if you want that instead later.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm; -- fuzzy search

-- ============================================================================
-- 1. ADMIN / ROLES
-- ============================================================================

create type user_role as enum ('super_admin', 'admin', 'staff', 'customer');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 2. SITE SETTINGS (singleton-ish key-value + structured config)
-- This table is what makes "two stores never look the same" possible.
-- ============================================================================

create table site_settings (
  id boolean primary key default true constraint single_row check (id),
  -- Identity
  store_name text not null default 'My Store',
  tagline text,
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  og_image_url text,

  -- Theming — every value here maps to a CSS variable at runtime
  theme jsonb not null default '{
    "mode_default": "light",
    "allow_mode_toggle": true,
    "colors": {
      "light": {"primary":"#111827","secondary":"#2563eb","accent":"#f59e0b","background":"#ffffff","surface":"#f8fafc","text":"#0f172a","muted":"#64748b","border":"#e2e8f0","success":"#16a34a","warning":"#d97706","danger":"#dc2626"},
      "dark": {"primary":"#f8fafc","secondary":"#60a5fa","accent":"#fbbf24","background":"#0b0f19","surface":"#111827","text":"#f1f5f9","muted":"#94a3b8","border":"#1f2937","success":"#22c55e","warning":"#f59e0b","danger":"#ef4444"}
    },
    "fonts": {"heading":"Poppins","body":"Inter","mono":"JetBrains Mono"},
    "radius": "lg",
    "button_style": "solid",
    "container_width": "1280px"
  }'::jsonb,

  -- Contact / socials / maps
  contact jsonb not null default '{
    "phone":"", "whatsapp":"", "email":"", "address":"",
    "map_lat": null, "map_lng": null,
    "opening_hours": [],
    "socials": {"facebook":"","instagram":"","twitter":"","youtube":"","linkedin":""}
  }'::jsonb,

  -- SEO defaults
  seo jsonb not null default '{
    "default_title":"", "default_description":"", "default_keywords":[],
    "google_site_verification":"", "google_analytics_id":"", "meta_pixel_id":""
  }'::jsonb,

  -- Feature toggles — lets a store enable/disable whole modules
  features jsonb not null default '{
    "wishlist": true, "compare": true, "reviews": true, "coupons": true,
    "emi_calculator": true, "bundle_builder": true, "trade_in": true,
    "repair_booking": true, "warranty_checker": true, "whatsapp_enquiry": true,
    "3d_models": true, "live_chat": false
  }'::jsonb,

  checkout jsonb not null default '{
    "currency":"INR", "currency_symbol":"₹", "tax_percent": 0,
    "cod_enabled": true, "online_payment_enabled": true,
    "payment_provider": "razorpay", "free_shipping_threshold": null,
    "flat_shipping_fee": 0
  }'::jsonb,

  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. HOMEPAGE / PAGE BUILDER (no-code layout)
-- Homepage & any custom page = an ordered list of "sections". Admin can
-- reorder, hide, and edit props of each section without touching code.
-- ============================================================================

create table pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,           -- 'home', 'about', 'warranty-policy', etc.
  title text not null,
  meta_title text,
  meta_description text,
  is_system boolean not null default false, -- true for home/cart/checkout (can't delete, can still edit sections)
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table page_sections (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid not null references pages(id) on delete cascade,
  type text not null,        -- 'hero','category_grid','featured_products','banner_strip',
                              -- 'testimonials','brand_logos','newsletter','rich_text',
                              -- 'countdown_offer','map','faq','custom_html', ...
  props jsonb not null default '{}'::jsonb,  -- section-specific content (headline, image_url, product_query, etc.)
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index on page_sections(page_id, sort_order);

create table nav_menus (
  id uuid primary key default uuid_generate_v4(),
  location text not null check (location in ('header','footer_col_1','footer_col_2','footer_col_3','mobile')),
  label text not null,
  url text,
  icon text,
  parent_id uuid references nav_menus(id) on delete cascade,
  sort_order int not null default 0,
  is_visible boolean not null default true
);

create table banners (
  id uuid primary key default uuid_generate_v4(),
  placement text not null, -- 'homepage_hero','category_top','cart_sidebar','popup', ...
  title text,
  subtitle text,
  image_url text,
  mobile_image_url text,
  link_url text,
  button_text text,
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true
);

-- ============================================================================
-- 4. CATALOG
-- ============================================================================

create table categories (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  icon text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  meta_title text,
  meta_description text
);

create type condition_grade as enum ('new', 'like_new', 'excellent', 'good', 'fair');

create table products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  sku text unique not null,
  slug text unique not null,
  name text not null,
  brand text,
  short_description text,
  description text,                    -- rich text / markdown

  condition_grade condition_grade not null default 'good',
  condition_notes text,                -- e.g. "minor scuff on lid, screen flawless"

  -- Device-specific health & specs (kept flexible via jsonb so any
  -- product type — laptop, phone, monitor, RAM stick — fits the same table)
  battery_health_percent int,          -- null for items without a battery
  warranty_months int not null default 0,
  warranty_terms text,
  specifications jsonb not null default '{}'::jsonb,
  -- e.g. {"CPU":"Intel i5-1135G7","RAM":"16GB","Storage":"512GB SSD",
  --       "Display":"14\" FHD","GPU":"Iris Xe","OS":"Windows 11", ...}

  price numeric(10,2) not null,
  compare_at_price numeric(10,2),      -- shows strikethrough MRP
  cost_price numeric(10,2),            -- admin-only, for margin reporting

  stock_quantity int not null default 0,
  low_stock_threshold int not null default 3,
  track_stock boolean not null default true,
  allow_backorder boolean not null default false,

  weight_kg numeric(6,3),
  dimensions_cm jsonb,                 -- {"l":30,"w":20,"h":2}

  is_active boolean not null default true,
  is_featured boolean not null default false,
  tags text[] default '{}',

  model_3d_url text,                   -- .glb/.gltf in Supabase Storage
  meta_title text,
  meta_description text,

  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(short_description,'')), 'C')
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_search_idx on products using gin(search_vector);
create index products_category_idx on products(category_id);
create index products_specs_idx on products using gin(specifications);

create table product_media (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('image','video','model_3d')),
  url text not null,
  alt_text text,
  sort_order int not null default 0
);

create table product_variants (
  -- e.g. same laptop model, different RAM/storage/color combos
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,                  -- "16GB / 512GB / Silver"
  sku text unique,
  price_delta numeric(10,2) not null default 0,
  stock_quantity int not null default 0,
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

create table bundles (
  -- Bundle Builder: admin defines eligible items + discount rule;
  -- customer assembles their own combo on the frontend.
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null default 0,
  is_active boolean not null default true
);

create table bundle_eligible_products (
  bundle_id uuid not null references bundles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  is_required boolean not null default false,  -- e.g. laptop is required, mouse/bag optional
  primary key (bundle_id, product_id)
);

-- ============================================================================
-- 5. WISHLIST / COMPARE / REVIEWS
-- ============================================================================

create table wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table comparisons (
  -- lightweight, session or user based, so guests can compare too
  id uuid primary key default uuid_generate_v4(),
  session_id text,
  user_id uuid references auth.users(id) on delete cascade,
  product_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  images text[] default '{}',
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,  -- admin moderates before it goes live
  created_at timestamptz not null default now()
);

create table testimonials (
  -- separate from product reviews: shown on homepage as trust content
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_photo_url text,
  quote text not null,
  rating int check (rating between 1 and 5),
  sort_order int not null default 0,
  is_visible boolean not null default true
);

-- ============================================================================
-- 6. CART / ORDERS / TRACKING
-- ============================================================================

create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text, -- for guest carts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  bundle_id uuid references bundles(id) on delete set null,
  added_at timestamptz not null default now()
);

create type order_status as enum (
  'pending_payment','confirmed','processing','packed',
  'shipped','out_for_delivery','delivered','cancelled','returned','refunded'
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,   -- human-friendly, e.g. ORD-2026-000123
  user_id uuid references auth.users(id) on delete set null,

  status order_status not null default 'pending_payment',
  status_history jsonb not null default '[]'::jsonb, -- [{status, note, at}]

  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  shipping_address jsonb not null,
  billing_address jsonb,

  subtotal numeric(10,2) not null,
  discount_total numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  tax_total numeric(10,2) not null default 0,
  grand_total numeric(10,2) not null,

  coupon_code text,
  payment_method text,                 -- 'cod','razorpay','stripe', ...
  payment_status text not null default 'pending',
  payment_reference text,

  courier_name text,
  tracking_number text,
  tracking_url text,
  estimated_delivery date,

  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name_snapshot text not null,  -- preserved even if product later edited/deleted
  sku_snapshot text,
  condition_snapshot text,
  unit_price numeric(10,2) not null,
  quantity int not null,
  line_total numeric(10,2) not null
);

-- ============================================================================
-- 7. COUPONS / OFFERS
-- ============================================================================

create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  max_discount_amount numeric(10,2),
  usage_limit int,
  usage_count int not null default 0,
  per_user_limit int default 1,
  applicable_category_ids uuid[] default '{}', -- empty = all categories
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true
);

-- ============================================================================
-- 8. UNIQUE FEATURES: trade-in, repair booking, warranty checker
-- ============================================================================

create table trade_in_enquiries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  device_type text not null,
  brand text, model text,
  condition_grade condition_grade,
  purchase_year int,
  photos text[] default '{}',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  estimated_value numeric(10,2),       -- admin fills after review
  status text not null default 'new' check (status in ('new','reviewing','offer_sent','accepted','rejected','completed')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table repair_services (
  -- admin-defined catalog of bookable services
  id uuid primary key default uuid_generate_v4(),
  name text not null,                  -- "Screen Replacement", "Battery Swap"
  device_category_id uuid references categories(id),
  description text,
  estimated_price_min numeric(10,2),
  estimated_price_max numeric(10,2),
  estimated_duration text,             -- "45–60 mins"
  is_active boolean not null default true
);

create table repair_bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  service_id uuid references repair_services(id),
  device_description text,
  issue_description text,
  preferred_date date,
  preferred_time_slot text,
  drop_off_or_pickup text check (drop_off_or_pickup in ('drop_off','pickup')),
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  status text not null default 'requested' check (status in ('requested','confirmed','in_progress','completed','cancelled')),
  admin_notes text,
  created_at timestamptz not null default now()
);

-- Warranty checker just queries orders/order_items + products.warranty_months
-- by order number or serial — no extra table needed unless you want to track
-- serial numbers explicitly:
create table product_serials (
  id uuid primary key default uuid_generate_v4(),
  order_item_id uuid references order_items(id) on delete cascade,
  serial_number text unique not null,
  warranty_start_date date not null default current_date,
  warranty_end_date date not null
);

-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table pages enable row level security;
alter table page_sections enable row level security;
alter table nav_menus enable row level security;
alter table banners enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_media enable row level security;
alter table product_variants enable row level security;
alter table bundles enable row level security;
alter table bundle_eligible_products enable row level security;
alter table wishlist_items enable row level security;
alter table comparisons enable row level security;
alter table reviews enable row level security;
alter table testimonials enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table coupons enable row level security;
alter table trade_in_enquiries enable row level security;
alter table repair_services enable row level security;
alter table repair_bookings enable row level security;
alter table product_serials enable row level security;

-- Helper: is the current user an admin/staff?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('super_admin','admin','staff')
  );
$$ language sql stable security definer;

-- --- Public read policies (storefront content) ---
create policy "public read site_settings" on site_settings for select using (true);
create policy "public read pages" on pages for select using (is_published or is_admin());
create policy "public read page_sections" on page_sections for select using (is_visible or is_admin());
create policy "public read nav_menus" on nav_menus for select using (is_visible or is_admin());
create policy "public read banners" on banners for select using (is_active or is_admin());
create policy "public read categories" on categories for select using (is_visible or is_admin());
create policy "public read products" on products for select using (is_active or is_admin());
create policy "public read product_media" on product_media for select using (true);
create policy "public read product_variants" on product_variants for select using (is_active or is_admin());
create policy "public read bundles" on bundles for select using (is_active or is_admin());
create policy "public read bundle_products" on bundle_eligible_products for select using (true);
create policy "public read approved reviews" on reviews for select using (is_approved or is_admin());
create policy "public read testimonials" on testimonials for select using (is_visible or is_admin());
create policy "public read coupons metadata" on coupons for select using (is_active); -- code validity check client-side; keep sensitive usage fields admin-only via a view if needed

-- --- Admin write policies (generic pattern, repeated per table) ---
create policy "admin write site_settings" on site_settings for all using (is_admin()) with check (is_admin());
create policy "admin write pages" on pages for all using (is_admin()) with check (is_admin());
create policy "admin write page_sections" on page_sections for all using (is_admin()) with check (is_admin());
create policy "admin write nav_menus" on nav_menus for all using (is_admin()) with check (is_admin());
create policy "admin write banners" on banners for all using (is_admin()) with check (is_admin());
create policy "admin write categories" on categories for all using (is_admin()) with check (is_admin());
create policy "admin write products" on products for all using (is_admin()) with check (is_admin());
create policy "admin write product_media" on product_media for all using (is_admin()) with check (is_admin());
create policy "admin write product_variants" on product_variants for all using (is_admin()) with check (is_admin());
create policy "admin write bundles" on bundles for all using (is_admin()) with check (is_admin());
create policy "admin write bundle_products" on bundle_eligible_products for all using (is_admin()) with check (is_admin());
create policy "admin moderate reviews" on reviews for update using (is_admin());
create policy "admin delete reviews" on reviews for delete using (is_admin());
create policy "admin write testimonials" on testimonials for all using (is_admin()) with check (is_admin());
create policy "admin write coupons" on coupons for all using (is_admin()) with check (is_admin());
create policy "admin view all orders" on orders for select using (is_admin());
create policy "admin update orders" on orders for update using (is_admin());
create policy "admin view order_items" on order_items for select using (is_admin());
create policy "admin manage trade_in" on trade_in_enquiries for all using (is_admin()) with check (is_admin());
create policy "admin manage repair_services" on repair_services for all using (is_admin()) with check (is_admin());
create policy "admin manage repair_bookings" on repair_bookings for all using (is_admin());
create policy "admin manage serials" on product_serials for all using (is_admin());
create policy "public read repair_services" on repair_services for select using (is_active or is_admin());

-- --- Customer-owned data policies ---
create policy "read own profile" on profiles for select using (auth.uid() = id or is_admin());
create policy "update own profile" on profiles for update using (auth.uid() = id);

create policy "manage own wishlist" on wishlist_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "manage own or guest comparison" on comparisons for all
  using (auth.uid() = user_id or user_id is null) with check (true);

create policy "insert own review" on reviews for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "manage own cart" on carts for all
  using (auth.uid() = user_id or user_id is null) with check (true);
create policy "manage own cart items" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and (c.user_id = auth.uid() or c.user_id is null)));

create policy "read own orders" on orders for select using (auth.uid() = user_id or is_admin());
create policy "create own orders" on orders for insert with check (auth.uid() = user_id or user_id is null);
create policy "read own order_items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "insert order_items with order" on order_items for insert with check (true);

create policy "create own trade_in" on trade_in_enquiries for insert with check (true);
create policy "read own trade_in" on trade_in_enquiries for select using (auth.uid() = user_id or is_admin());

create policy "create own repair booking" on repair_bookings for insert with check (true);
create policy "read own repair booking" on repair_bookings for select using (auth.uid() = user_id or is_admin());

create policy "read own serials" on product_serials for select using (
  exists (select 1 from order_items oi join orders o on o.id = oi.order_id
          where oi.id = order_item_id and (o.user_id = auth.uid() or is_admin()))
);

-- ============================================================================
-- 10. SEED: minimal defaults so a fresh clone isn't blank
-- ============================================================================

insert into site_settings (id) values (true) on conflict do nothing;

insert into pages (slug, title, is_system) values
  ('home', 'Home', true),
  ('about', 'About Us', false),
  ('warranty-policy', 'Warranty Policy', false),
  ('return-policy', 'Return & Refund Policy', false),
  ('contact', 'Contact', true)
on conflict do nothing;

insert into page_sections (page_id, type, props, sort_order)
select id, 'hero', '{"headline":"Quality Refurbished Tech","subheadline":"Tested. Graded. Guaranteed.","cta_text":"Shop Now","cta_link":"/products"}'::jsonb, 0
from pages where slug = 'home'
on conflict do nothing;
