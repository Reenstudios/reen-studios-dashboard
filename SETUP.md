# Reën Studios Dashboard — Full Setup Guide

This gets you a password-protected dashboard with: artwork library, AI caption generation (Claude),
AI chat assistant (Claude), content calendar, and Instagram insights via your Meta Business account.
Auto-publishing to Instagram is included as an optional final step once your Meta app is approved —
everything else works without it (you copy/paste captions manually in the meantime).

Total cost: $0/month except Claude API usage (pennies per caption).

---

## STEP 1 — Supabase (database + image storage + auth)

1. Go to supabase.com → sign up free → "New Project"
2. Name it `reen-studios`, set a strong database password (save it somewhere safe), pick a region close to South Africa (e.g. `eu-west` or `eu-central`)
3. Once created, go to **Project Settings → API**. Copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this one secret — server-side only)
4. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` (in this folder) → Run
5. Go to **Storage** → create a bucket called `artwork-images` → set it to **Public**

## STEP 2 — Claude API (captions + AI assistant)

1. Go to console.anthropic.com → sign up → **Get API Keys** → create a key
2. Copy it — you'll add it as `ANTHROPIC_API_KEY` in your environment variables (Step 5)
3. Pricing is pay-as-you-go; captions/chat for a one-person studio will likely run a few dollars a month at most, not a subscription

## STEP 3 — Meta Business (Instagram insights, and publishing later)

You already have a Meta Business account, so:

1. Go to developers.facebook.com → **My Apps** → **Create App** → choose "Business" type
2. Name it `Reen Studios Dashboard`
3. In the app dashboard, add the **Instagram Graph API** product
4. Go to **Instagram Graph API → Connected Instagram Accounts** and connect your Reën Studios Instagram (it must be a Business or Creator account, linked to a Facebook Page — Meta requires this)
5. Generate a **long-lived access token**:
   - Go to **Tools → Graph API Explorer**
   - Select your app, select your Page, request these permissions: `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement`
   - Generate token → then exchange it for a long-lived token (60 days) using the token debug tool, or use the `/oauth/access_token` endpoint with `grant_type=fb_exchange_token`
   - Save this token — you'll refresh it every ~60 days (a reminder, not code you need to write yet)
6. This unlocks **read-only insights** (reach, saves, engagement per post) — no app review needed for this, since you're only reading your own account's data.
7. **Publishing** (auto-posting) requires Meta's **App Review** for the `instagram_content_publish` permission — this is a form you submit with a screen recording showing the feature working. It usually takes 3–7 days. I've stubbed the publish endpoint so you can request this later without rebuilding anything.

## STEP 4 — Password protection

Simplest approach for a one-person dashboard: a single shared password checked in middleware, stored as an environment variable — no need for full user accounts.

`DASHBOARD_PASSWORD` env var → set in Step 5.

## STEP 5 — Deploy to Vercel (free) + connect your domain

1. Push this project to a GitHub repo (create one, e.g. `reen-studios-dashboard`)
2. Go to vercel.com → sign up with GitHub → **Import Project** → pick the repo
3. Add these Environment Variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `DASHBOARD_PASSWORD`
   - `META_ACCESS_TOKEN` (once you have it)
   - `META_IG_USER_ID` (your Instagram Business account ID, found via Graph API Explorer)
4. Deploy
5. Go to **Project Settings → Domains** → add your Reën Studios domain (e.g. `studio.reenstudios.com` or your root domain)
6. Vercel gives you DNS records to add — log into wherever you bought the domain (e.g. domains.co.za, GoDaddy) and add the CNAME/A record they show you. Propagation usually takes 10 minutes to a few hours.

---

## What's in this folder

- `supabase/schema.sql` — full database schema (artworks, posts, calendar)
- `lib/supabaseClient.ts` — Supabase connection helper
- `middleware.ts` — password protection for the whole app
- `app/login/page.tsx` — login screen
- `app/api/claude/route.ts` — caption generation + chat assistant endpoint
- `app/api/meta/insights/route.ts` — pulls Instagram post insights
- `app/api/meta/publish/route.ts` — stub for future auto-publishing
- `app/dashboard/page.tsx` — main dashboard skeleton (artwork library + generator + calendar placeholder)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```
