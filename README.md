# Heavy Tabs

A guitar/bass/drum tablature editor with cloud sync and public sharing.

## Quick Start

```bash
npm install
npm run dev
```

The app works offline with localStorage. To enable cloud features, see [Supabase Setup](#supabase-setup).

---

## Implementation Plan

### Overview

Add user accounts, cloud sync, and public sharing to Heavy Tabs using Supabase.

**Current state:** Single-file React app (`tab-app.jsx`) with localStorage persistence.

**Goal:** Enable authenticated users to save projects to the cloud and share tabs publicly.

---

### Design Priorities

| Priority | Approach |
|----------|----------|
| **Scalable** | Supabase auto-scales database + Vercel edge functions |
| **Debuggable** | Modular components, TypeScript, error boundaries, structured logging |
| **Extensible** | Clean separation: hooks for logic, components for UI, lib for services |
| **Secure** | Supabase RLS, server-side validation, no secrets in client |
| **Cheap** | Supabase free tier (500MB, 50k MAU), Vercel free tier |
| **Zero support** | Magic link only (no passwords), self-service UX, clear error messages |

#### Cost Breakdown (Free Tier Limits)

| Service | Free Tier | More Than Enough For |
|---------|-----------|---------------------|
| Supabase | 500MB DB, 50k users, 5GB bandwidth | Thousands of projects |
| Vercel | 100GB bandwidth, unlimited deploys | Heavy usage |
| Total | **$0/month** | Personal + sharing use case |

---

### Database Schema

#### Tables

```sql
-- 1. profiles (auto-created on signup)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- 2. projects (user's saved tabs)
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_name text not null default 'Untitled Project',
  bpm integer not null default 120,
  time_signature jsonb not null,
  note_resolution jsonb not null,
  project_key text not null default 'E',
  tunings jsonb not null,
  string_counts jsonb not null,
  sections jsonb not null default '[]',
  tab_data jsonb not null default '{}',
  local_id text, -- for migration mapping
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. shared_links (public sharing)
create table public.shared_links (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null, -- 8-char URL-safe ID
  is_active boolean default true,
  allow_copy boolean default true,
  view_count integer default 0,
  created_at timestamptz default now()
);
```

#### Row Level Security

- Users can CRUD their own projects
- Anyone can view projects with active share links
- Users can manage their own share links

---

### File Structure

```
heavy-tabs/
├── src/
│   ├── App.tsx                   # Main app with routing
│   ├── components/
│   │   ├── TabEditor.tsx         # Extracted from tab-app.jsx
│   │   ├── PublicViewer.tsx      # Read-only shared view
│   │   ├── Library.tsx           # Project list
│   │   ├── AuthModal.tsx         # Magic link sign in
│   │   ├── ShareModal.tsx        # Share management
│   │   ├── MigrationDialog.tsx   # Import local projects
│   │   └── ErrorBoundary.tsx     # Catch render errors
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth state + methods
│   │   ├── useProjects.ts        # CRUD operations
│   │   └── useSharing.ts         # Share link management
│   ├── lib/
│   │   ├── supabase.ts           # Client init
│   │   ├── storage.ts            # localStorage helpers
│   │   └── constants.ts          # Tunings, chords, themes
│   ├── types/
│   │   └── index.ts              # Project, User, ShareLink types
│   └── styles/
│       ├── _tokens.scss          # Design tokens
│       ├── _mixins.scss          # Responsive, typography mixins
│       └── main.scss             # Main stylesheet
├── supabase/
│   └── migrations/               # SQL migration files
├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

### Implementation Phases

#### Phase 1: Foundation
1. Create Supabase project at supabase.com
2. Run database migrations (profiles, projects, shared_links, RLS)
3. Set up Vite build with proper project structure
4. Extract TabEditor component from `tab-app.jsx`
5. Create Supabase client (`src/lib/supabase.ts`)

#### Phase 2: Authentication
1. Create `useAuth` hook (session, signInWithMagicLink, signOut)
2. Build AuthModal component (email input → magic link sent → check email)
3. Add UserMenu to header (email display, sign out)
4. Wire auth state into App

*Magic link only = no passwords to forget, no reset emails, no support burden*

#### Phase 3: Cloud Sync
1. Create `useProjects` hook for CRUD
2. Implement save-to-cloud on auto-save trigger
3. Update Library to fetch from Supabase when authenticated
4. Add offline queue for failed syncs

#### Phase 4: Migration
1. Build MigrationDialog for first-time login
2. Import localStorage projects to Supabase
3. Map `local_id` for reference
4. Handle conflicts (last-write-wins)

#### Phase 5: Public Sharing
1. Build ShareModal (generate/copy/revoke links)
2. Create PublicViewer component (read-only mode)
3. Add route `/tab/:slug` for shared tabs
4. Implement "Copy to my library" for signed-in viewers

#### Phase 6: Deploy
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Configure custom domain (optional)

---

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Supabase (Postgres + Auth) | Free tier, managed, secure RLS |
| Auth method | Magic link only | No passwords = no reset requests |
| Language | TypeScript + React (JSX) | Type safety, Claude-friendly |
| Styling | Sass (SCSS) | Variables, mixins, nesting |
| Sync strategy | Auto-save + localStorage fallback | Works offline, syncs when online |
| Sharing | 8-char slug URLs | Simple, no auth required to view |
| Hosting | Vercel | Free, auto-deploy from GitHub |
| Build tool | Vite | Fast, built-in Sass support |
| Error tracking | Console + Error boundaries | Free, sufficient for personal use |

---

### Verification

1. **Auth flow:** Sign up, sign in, sign out, magic link
2. **Cloud save:** Create project, refresh page, verify data persists
3. **Offline:** Disable network, make changes, reconnect, verify sync
4. **Migration:** Clear Supabase, sign in with localStorage projects, verify import
5. **Sharing:** Generate link, open in incognito, verify read-only view
6. **Cross-device:** Sign in on different browser, verify projects sync

---

## Services Explained (Simple Version)

### Supabase
A place to store your app's data on the internet (not just on your computer).

**Analogy:** Your app currently saves tabs to your browser like a notebook on your desk. Supabase is like a locker at school - you can access your stuff from any computer, and you can give friends the combination to see it too.

**What it gives you:**
- Database (stores projects in the cloud)
- User accounts (magic link login - no passwords)
- Security rules (who can see what)

### Vercel
Puts your website on the internet so anyone can visit it.

**Analogy:** Right now your app only runs on your computer. Vercel is like a TV station that broadcasts your app to the world. You give it your code (via GitHub), and it gives you a URL like `heavytabs.com`.

**What it gives you:**
- Hosting (your app lives at a real URL)
- Auto-updates (push to GitHub → site updates automatically)

### How They Connect
```
You → GitHub → Vercel (shows your app)
                 ↓
              Supabase (stores data)
```

### Cost Summary
| Service | Free Tier Includes |
|---------|-------------------|
| Supabase | 500MB DB, 50k users, 5GB bandwidth |
| Vercel | 100GB bandwidth, unlimited deploys |
| **Total** | **$0/month** |

---

## Supabase Setup

1. **Create project** at [supabase.com](https://supabase.com)
2. **Run migration** in SQL Editor (copy from `supabase/migrations/001_initial_schema.sql`)
3. **Configure auth:**
   - Enable Email provider
   - Add `http://localhost:5173/auth/callback` to redirect URLs
4. **Get credentials** from Settings → API
5. **Create `.env`:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

See `supabase/README.md` for detailed instructions.

---

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## License

MIT
