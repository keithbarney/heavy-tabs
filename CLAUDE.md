# Heavy Tabs

Guitar/bass/drum tablature editor with cloud sync and public sharing.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Sass (SCSS modules) |
| Icons | Lucide React |
| Routing | React Router |
| Backend | Supabase (Postgres + Auth + RLS) |
| Auth | Magic link (no passwords) |
| Hosting | Vercel (planned) |

---

## Project Structure

```
heavy-tabs/
├── src/
│   ├── App.tsx                    # Main app with routing
│   ├── components/
│   │   ├── TabEditor.tsx          # Main editor (playback, editing, history)
│   │   ├── TabEditor.module.scss
│   │   ├── AuthModal.tsx          # Magic link sign in
│   │   ├── Library.tsx            # Project list
│   │   ├── MigrationDialog.tsx    # Import localStorage → cloud
│   │   ├── ShareModal.tsx         # Share link management
│   │   ├── PublicViewer.tsx       # Read-only shared view
│   │   ├── UserMenu.tsx           # Account dropdown
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth state + methods
│   │   ├── useProjects.ts         # CRUD, sync, migration
│   │   └── useSharing.ts          # Share link management
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── storage.ts             # localStorage helpers
│   │   └── constants.ts           # Tunings, chords, themes
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   └── styles/
│       ├── _tokens.scss           # Design tokens
│       ├── _mixins.scss           # Button, input, responsive mixins
│       └── main.scss              # Global styles
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema + RLS
├── .env                           # Supabase credentials (not committed)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Scripts

```bash
npm install     # Install dependencies
npm run dev     # Start dev server (localhost:5173)
npm run build   # Build for production
npm run preview # Preview production build
```

---

## Environment Variables

Create `.env` in project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Database Schema

Three tables with Row Level Security:

### profiles
- Auto-created on user signup via trigger
- Stores display_name

### projects
- User's saved tabs
- Fields: project_name, bpm, time_signature, note_resolution, project_key, tunings, string_counts, sections, tab_data
- `local_id` maps localStorage projects after migration
- `cloudId` (in frontend) tracks the Supabase UUID

### shared_links
- 8-character slug for public sharing
- is_active, allow_copy, view_count

---

## Key Patterns

### UUID Handling
- localStorage uses short random IDs (`generateId()`)
- Supabase uses proper UUIDs (auto-generated)
- `LocalProject.cloudId` tracks the Supabase UUID
- Migration creates new UUIDs, stores original ID in `local_id`

### Offline Support
- All changes save to localStorage first
- Failed cloud syncs go to pending queue
- Queue processes when back online

### Button Styling
All buttons use `@include button-base` which provides:
- 5% white background (10% on hover)
- Consistent padding and border-radius
- `button-primary` for accent-colored actions
- `button-danger` for destructive actions

---

## Services

| Service | Purpose |
|---------|---------|
| **Supabase** | Database (Postgres), user authentication, security rules |
| **SendGrid** | Sends magic link emails for passwordless login |
| **Vercel** | Hosts the app, auto-deploys from GitHub |

All three have generous free tiers - this project costs $0/month to run.

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | MainView → TabEditor | Main editor |
| `/tab/:slug` | PublicViewer | Read-only shared tab |
| `/auth/callback` | AuthCallback | Magic link redirect handler |

---

## Instruments

### Guitar/Bass
- Configurable string counts (4-8)
- Standard and drop tunings
- Transposition by key
- Valid inputs: 0-9, h, p, /, \, b, x, m, ~, -

### Drums
- 10-line kit (china, crash, ride, hi-hats, toms, snare, kick)
- Valid inputs: x, o, X, O, -, f, g, d, b, r

---

## Playback

- Web Audio API for synthesis
- Click track option
- Loop mode
- Tap tempo
- Playback position highlighting

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| Arrows | Navigate cells |
| 0-9 | Enter fret |
| h/p | Hammer-on/Pull-off |
| Delete | Clear selection |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| Ctrl+C/V | Copy/Paste |
| ? | Show shortcuts |
