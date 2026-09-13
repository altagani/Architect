# Master Refurbished-Electronics Ecommerce Template

Next.js 14 (App Router) + Supabase + Vercel. Built so one codebase can power
unlimited visually-distinct stores, each with its own Supabase project and
Vercel deployment, customized entirely from `/admin` — no code edits per store.

---

## ⚠️ Read this first — what's actually in this scaffold

This is a **starter/architecture repo**, not a finished production app. Given
the scope of the original brief (full multi-tenant admin-driven ecommerce
platform with 3D models, EMI calculators, trade-in flows, drag-and-drop
page builder, etc.), one response can realistically deliver the *hard
architectural decisions done correctly* plus *working examples of every
pattern* — not thousands of lines of fully tested feature code.

**Fully built and working as shown:**
- Complete Supabase schema (`supabase/schema.sql`) — 30+ tables, RLS policies
  for every table, roles, seed data. This is production-grade, not a toy.
- Runtime CSS-variable theming system (colors/fonts/radius editable in
  `/admin/appearance/theme`, applied instantly, no rebuild)
- No-code homepage builder (`page_sections` table + drag-and-drop admin UI +
  section registry pattern) — adding a new section type is one file + one
  registry line
- Product card with condition grading, battery health, wishlist, compare
- EMI calculator logic
- WhatsApp quick-enquiry FAB
- Auth-aware middleware protecting `/admin` by role
- Header/footer pulling identity from the DB, zero hardcoded brand copy

**Scaffolded / stubbed — pattern shown, needs completion:**
- Search bar routes to `/search` but the results page + full-text query
  handler isn't written (schema has the `tsvector` column + GIN index ready)
- Cart/checkout/payment (Razorpay) — schema and package deps are in place;
  UI and payment webhook are not
- Product detail page, category listing, filters/sorting UI
- Wishlist/compare pages (the toggle hooks work; the "view all" pages aren't built)
- Bundle builder, trade-in form, repair booking form — tables exist, no UI yet
- Warranty checker page
- 3D model (GLB/GLTF) viewer — `@react-three/drei` is in `package.json`
  (its `<Stage>` + `useGLTF` are the right primitives); no viewer component yet
- Order tracking page, order confirmation emails
- Coupon validation logic at checkout
- Admin CRUD screens for products/categories/orders/coupons/banners/nav menus
  (the theme + homepage-builder admin pages show the pattern to repeat)
- Reviews submission + moderation UI

None of this is placeholder text — every stub above has a real table, a real
RLS policy, and in most cases a real component signature waiting for its
data-fetching logic. The fastest path forward is treating each bullet as a
ticket and working through them with an AI pair-programmer (Claude Code is a
good fit for exactly this — see below) using the schema as ground truth.

---

## Architecture decisions (the "why" behind this being a real master template)

**Multi-tenancy = one Supabase project per store, not shared-DB tenant_id.**
Real data isolation, independent scaling/billing, no risk of a bug leaking
Store A's orders into Store B. The tradeoff: you manage N Supabase projects
instead of one. If you'd rather have a single shared DB with a `tenant_id`
column and tenant-scoped RLS everywhere (cheaper at very high store counts,
more complex to secure correctly), that's a different schema — flag it if
you want that version instead.

**All visual identity lives in `site_settings.theme` as CSS variables**,
consumed by Tailwind via `rgb(var(--color-primary) / <alpha-value>)`. Two
stores on identical code can look completely unrelated because literally no
color, font, or radius is hardcoded in a component.

**Homepage/pages = ordered `page_sections` rows, dispatched through a
registry** (`SectionRenderer.tsx`). Admin drag-and-drop reorders, hides, and
edits section `props` (jsonb) — no code deploy per layout change.

**Specs are jsonb, not fixed columns** — the same `products` table holds a
laptop's CPU/RAM/GPU and a phone's screen size/camera without a schema
migration per category.

---

## Duplicating this template into a brand-new store

1. **Clone the repo** → new GitHub repo (`git clone`, remove old remote, push to new repo).
2. **New Supabase project** → Project Settings → API: copy URL + anon key +
   service role key into a new `.env.local` (see `.env.example`).
3. **Run the schema**: Supabase SQL Editor → paste `supabase/schema.sql` → Run.
   This creates all tables, RLS, and seeds one `site_settings` row + default pages.
4. **Create your first admin user**: sign up normally via Supabase Auth, then
   in the SQL Editor:
   ```sql
   update profiles set role = 'super_admin' where id = '<your-auth-user-id>';
   ```
5. **New Vercel project** → import the new repo → paste the same env vars →
   Deploy.
6. **Customize from `/admin`**: logo, colors, fonts, homepage sections, nav,
   categories, products, contact info, map location — all in the UI, zero
   code changes.
7. Repeat for store #2, #3, ... — each is fully independent.

---

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's keys
npm run dev
```

## Recommended order to finish the remaining features

1. Product listing + PDP (unblocks everything downstream)
2. Cart + checkout + Razorpay webhook
3. Admin product/category CRUD (you need this to test #1–2 with real data)
4. Search results page (schema's ready — it's a query + UI)
5. Wishlist/compare "view all" pages
6. Trade-in / repair booking forms (simple insert forms against existing tables)
7. Order tracking + warranty checker
8. 3D model viewer, bundle builder, coupon logic, review submission
9. Remaining admin CRUD screens (banners, nav menus, coupons, testimonials)
