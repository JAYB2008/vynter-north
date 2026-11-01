# Vynter North — Rebuild & Completion Status

**Last Updated:** Completion of Phase 5 (100% Specification Met)

---

## 1. Codebase Inventory Audit

### Routes & Pages (`app/`)
- `app/page.tsx` — Landing page with Instrument Serif 64px hero, live streaming direction board, problem statement, real numbered sequences for creators/studios, featured cards, protected features, works with, pricing/roadmap teasers, FAQ, live counters (Done)
- `app/signup/page.tsx` — Multi-screen wizard: Creator vs Studio choice, credentials, role profile, studio agreement/verification, 16-char emergency recovery code generation, ready screen (Done)
- `app/signin/page.tsx` — Username + password with rate limiting (5 attempts per 10 mins) and "Forgot password?" link (Done)
- `app/forgot-password/page.tsx` — Username + recovery code + new password, issues new recovery code upon success (Done)
- `app/marketplace/page.tsx` — 5 tabs (All, Free, For rent, For sale, Rising), filter drawer, poster card 4:5 grid, floating Compare bar (Done)
- `app/characters/[id]/page.tsx` — Canonical character page with sticky action panel (1d/7d/30d, trial, buyout), 6 rich tabs (Overview, Personality preview with server-side ~140-char excerpts, Reel, Try scene interactive test, Reviews, Details with fingerprint hash) (Done)
- `app/marketplace/compare/page.tsx` — Side-by-side comparison table of 2–3 selected characters (Done)
- `app/certificate/[id]/page.tsx` — Printable registration certificate with SHA-256 fingerprint, QR code, print stylesheet, and honest blockchain roadmap note (Done)
- `app/creators/[username]/page.tsx` — Public creator profile with bio, specialties chips, verification mark, website link, and character poster cards (Done)
- `app/skills/page.tsx` — Skills blueprint marketplace with "adds:" first two bullets, categories, word counts, installs (Done)
- `app/skills/[id]/page.tsx` — Skill detail showing value-first: what it adds bullets, before/after mini demo, public excerpt <=150 words, locked content until acquired, and "Apply to character" modal (Done)
- `app/demo/page.tsx` — Full-width interactive hero direction board with 3 genre scenes per demo character, word-count multiplier, "Why this output" panel, field attribution, and static fallback (Done)
- `app/leaderboard/page.tsx` — Top 50 ranked characters by fame score with genre/tier filters and weekly snapshot rank movement (Done)
- `app/casting/page.tsx` — Public open casting calls from studios with "Apply with character" audition modal (Done)
- `app/connect/page.tsx` — Public MCP connector explainer with Streamable HTTP instructions for Claude (web/mobile/desktop) and ChatGPT (Done)
- `app/pricing/page.tsx` — Creator plans (Free, Starter $9/mo, Creator $25/mo, Studio $60/mo), rental terms, and 20% platform fee breakdown with test mode banner (Done)
- `app/how-it-works/page.tsx` — Architectural diagram of the remote MCP loop (Studio -> Claude -> Vynter North server -> Finished direction -> Claude -> Studio) in plain words (Done)
- `app/roadmap/page.tsx` — Milestones with Live, Building, and Planned status labels per Section 7.10 (Done)
- `app/legal/terms/page.tsx` — Sensible plain-language terms draft with "Draft — pending legal review" notice (Done)
- `app/legal/privacy/page.tsx` — Plain-language privacy policy draft explaining zero-leakage identity protection with "Draft — pending legal review" notice (Done)
- `app/status/page.tsx` — Public status dashboard consuming `/api/health` (Done)
- `app/checkout/page.tsx` — Sandboxed test checkout page with order summary, "Test mode — no real money moves" notice, mock card form, 20% platform fee accounting, and redirect to library (Done)

### Creator Mode (`app/dashboard/...`)
- `app/dashboard/overview/page.tsx` & `app/dashboard/page.tsx` — Creator overview with live performance metrics and character roster (Done)
- `app/dashboard/characters/page.tsx` — Creator characters management list (Done)
- `app/dashboard/characters/new/page.tsx` — 8-step creator wizard with persistent progress, autosave every step and 20s, "Check my sheet" NIM scorer, and similarity check (Done)
- `app/dashboard/characters/[id]/page.tsx` — Character management with Performance, Rentals, Reviews replies, Offers, Settings, Deletion protection guard, and Playground test engine (`source='creator_test'`) (Done)
- `app/dashboard/characters/[id]/edit/page.tsx` — Character edit with versioned snapshots (Done)
- `app/dashboard/offers/page.tsx` — Buyout offer negotiation threads with Accept, Decline, and Counter (Done)
- `app/dashboard/earnings/page.tsx` — Revenue tracking with platform fee breakdown, per-character table, and test mode notice (Done)
- `app/dashboard/skills/page.tsx` — Creator skill templates manager (Done)
- `app/dashboard/skills/new/page.tsx` — Create skill template form (Done)
- `app/dashboard/reviews/page.tsx` — Creator reviews hub with breakdown scores and single-reply mechanism (Done)
- `app/dashboard/notifications/page.tsx` — Notification center with unread indicators and mark-all-read (Done)
- `app/dashboard/settings/page.tsx` — Account settings, avatar upload, password change, recovery code regeneration, account key regeneration, and guarded account deletion (Done)

### Studio Mode (`app/studio/...`)
- `app/studio/overview/page.tsx` & `app/studio/page.tsx` — Studio overview with active rentals, remaining credits, and next actions (Done)
- `app/studio/library/page.tsx` — Studio library with active rentals, 10-day grace period status, credits bar, and renewal links (Done)
- `app/studio/library/[rentalId]/page.tsx` — Behavior controls (Humor, Physical, Dialogue, Full vs Appearance only mode, inline tag guidance, pass code, and "End rental now" test helper) (Done)
- `app/studio/workspace/page.tsx` — Multi-character prompt workspace with Keep (charges 1 credit), Discard/Retry (free up to 10 previews per group), "Why this output" panel, copy button, and session history (Done)
- `app/studio/history/page.tsx` — Generation history with status chips, character tags, and quick copy (Done)
- `app/studio/saved/page.tsx` — Saved/bookmarked characters roster (Done)
- `app/studio/offers/page.tsx` — Studio buyout offers manager (Done)
- `app/studio/casting/page.tsx` — Studio casting calls manager with Shortlist, Decline, and "Invite to rent" (Done)
- `app/studio/reviews/page.tsx` — Studio reviews hub for reviewing ended rentals (4 star categories + min 50-char review) and past submissions (Done)
- `app/studio/connect/page.tsx` — Personal Streamable HTTP MCP link, live connection log of recent calls, server-side test connection button, and copy-ready sample prompts (Done)
- `app/studio/notifications/page.tsx` — Studio notifications center (Done)

### Admin (`app/admin/...`)
- `app/admin/page.tsx` — Admin metrics overview (accounts, characters, rentals, generations, MCP calls) (Done)
- `app/admin/characters/page.tsx` — Character moderation with Featured, Demo, Legend, and Suspend toggles (Done)
- `app/admin/verifications/page.tsx` — Studio verification queue with portfolio/document review, approve/reject, and notes (Done)
- `app/admin/mcp-logs/page.tsx` — Real-time MCP call logs viewer (Done)

### API Endpoints (`app/api/...`)
- `POST /api/auth/signup` — Username + password + recovery hash (Done)
- `POST /api/auth/signin` — Username + password with rate limiting (Done)
- `POST /api/auth/signout` — Clears `vn_session` cookie (Done)
- `POST /api/auth/recover` — Recovery code password reset (Done)
- `GET /api/auth/me` — Current session account and active mode (Done)
- `POST /api/auth/switch-mode` — Switches active mode between creator and studio (Done)
- `POST /api/auth/add-role` — Adds secondary creator or studio role (Done)
- `POST /api/auth/update-profile` — Updates display name, bio, specialties, website (Done)
- `POST /api/auth/change-password` — Updates password with bcrypt hash verification (Done)
- `POST /api/auth/regenerate-recovery` — Generates and issues new recovery code (Done)
- `POST /api/auth/regenerate-key` — Generates new private MCP account key (Done)
- `DELETE /api/auth/delete-account` — Deletes account with active rental protection (Done)
- `GET /api/characters` & `POST /api/characters` — Characters listing and draft creation (Done)
- `GET /api/characters/[id]` & `PATCH /api/characters/[id]` & `DELETE /api/characters/[id]` — Character detail with server-side ~140-char excerpt cutting and rental deletion protection (Done)
- `POST /api/characters/[id]/publish` — 8-step validation, similarity check (5-word-shingle Jaccard), and SHA-256 fingerprinting (Done)
- `POST /api/characters/check-sheet` — NVIDIA NIM character sheet quality check returning 0-100 specificity score and 3 suggestions (Done)
- `GET /api/characters/check-name` — Live creator-scoped name availability (Done)
- `POST /api/characters/[id]/voice-analyze` — Voice profile descriptor (Done)
- `POST /api/enrich` — Character Intelligence engine route with access checking, scene-group retry tracking, and preview generation (Done)
- `POST /api/generations/action` — Handles Keep (charges 1 credit) and Discard (free) (Done)
- `GET /api/rentals` & `POST /api/rentals` — Studio rentals listing and creation (Done)
- `GET /api/rentals/[id]` & `PATCH /api/rentals/[id]` — Rental details, settings updates, and "End rental now" test helper (Done)
- `POST /api/checkout` — Sandboxed checkout for trials, rentals, buyouts, top-ups with 20% platform fee (Done)
- `GET /api/reviews` & `POST /api/reviews` — Reviews listing and submission with 4 category ratings and min 50 chars (Done)
- `POST /api/reviews/[id]/reply` — Creator single reply (Done)
- `POST /api/reviews/[id]/vote` — Helpful vote toggle (Done)
- `GET /api/offers` & `POST /api/offers` — Offers listing and submission (Done)
- `PATCH /api/offers/[id]` — Offer status updates: Accept (marks character sold), Decline, Counter (Done)
- `GET /api/skills` & `POST /api/skills` — Skills catalog and template creation (Done)
- `GET /api/skills/[id]` & `POST /api/skills/[id]/acquire` — Template detail (public excerpt) and acquisition unlock (Done)
- `GET /api/casting` & `POST /api/casting` — Casting calls listing and creation (Done)
- `POST /api/casting/[id]/apply` & `GET /api/casting/[id]/applications` — Applications and brief management (Done)
- `POST /api/mcp/[key]` — Remote Streamable HTTP MCP server implementing all 6 tools (`list_my_characters`, `check_character`, `enrich_scene`, `keep_generation`, `discard_generation`, `account_status`) over JSON-RPC 2.0 with logging (Done)
- `GET /api/mcp/logs` — Returns last 10 MCP calls for live connection log (Done)
- `POST /api/mcp/test-connection` — Tests MCP server connectivity server-side (Done)
- `GET /api/notifications` & `POST /api/notifications` — Notification retrieval and mark read (Done)
- `GET /api/cron/expiry` — Daily rental expiry notification cron (5-day and 1-day warnings) (Done)
- `POST /api/upload` — File uploads with size and MIME validation (Done)
- `GET /api/health` — Real database check + cached NIM call + missing env disclosure (Done)
- `GET /api/creators/[username]` — Public creator profile endpoint (Done)

### Core Libraries & Design
- `lib/enrichment.ts` — Upgraded Character Intelligence Engine with paragraph retrieval scoring up to 900 words, scene categorization, detail matching, multi-character context, bracket tag overrides, and fallback synthesis (Done)
- `lib/db.ts` — Server-only database layer (`import 'server-only'`) using service-role key + memory fallback without pre-seeded characters (Done)
- `lib/auth.ts` — bcrypt hashing, 16-char recovery codes (`XXXX-XXXX-XXXX-XXXX`), `vn_session` JWT via `jose`, `getSession()`, `requireAccount()`, `requireMode()`, `isAdmin()` (Done)
- `lib/api.ts` — Universal fetch client converting network exceptions into clean user-friendly messages ("Couldn't reach Vynter North..."), preventing any "Failed to fetch" (Done)
- `components/Logo.tsx` — Universal Logo component using `public/logo.png` with geometric SVG fallback and Instrument Serif wordmark (Done)
- `app/globals.css` — Design system CSS variables: `--night`, `--panel`, `--panel-raised`, `--line`, `--text`, `--text-dim`, `--glacier`, `--glacier-ink`, `--marquee`, `--ok`, `--warn`, `--bad`; typography (Instrument Serif, Instrument Sans, JetBrains Mono); 2px poster corners (Done)

---

## 2. Specification Compliance Summary
| Phase | Goal | Status | Checkpoint Verification |
|---|---|---|---|
| P1 | Foundation: server-only data access, username/password auth, session, roles, theme, navbar/footer, logo, health, error handling | **DONE** | Sign up, sign in, sign out, mode switch, account deletion guard verified |
| P2 | Core loop: creator wizard -> character page -> marketplace -> demo + workspace enrichment -> MCP server + Connect page | **DONE** | 8-step wizard, character page with excerpts, marketplace with 5 tabs, live hero board, Streamable HTTP MCP server verified |
| P3 | Commerce: trial, rental, credits, test checkout, keep/discard, expiry + grace, reviews, fame score | **DONE** | 3-day trial (15 credits), 1d/7d/30d rental, buyout, keep charges 1 credit, preview free up to 10, reviews & fame formula verified |
| P4 | Everything else: dashboards, offers/purchase, skills marketplace, leaderboard, casting, compare/saved, notifications, certificate | **DONE** | Creator/studio dashboards, offers, skills blueprint, leaderboard, casting, compare table, certificate page verified |
| P5 | Admin, pricing, roadmap, legal pages, polish, QA script | **DONE** | Admin gated controls, pricing, how it works, roadmap, legal terms/privacy, full build passes without errors |

**Missing Items:** 0
**Build Output:** Exit code 0 (all routes and static pages generated cleanly)
