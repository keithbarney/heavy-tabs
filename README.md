# Heavy Tabs 🎸

A free, web-based guitar/bass/drum tablature editor with cloud sync, playback, and public sharing.

**[→ Try it at heavy-tabs.app](https://heavy-tabs.app)**

## Features

- **Multi-instrument** — Guitar (6/7/8-string), bass (4/5/6-string), drums (10-line kit)
- **Cloud sync** — Sign in with Google or magic link, access your tabs anywhere
- **Playback** — Built-in audio with click track, speed control, count-in, and loop
- **Sharing** — Generate public links to share your tabs with anyone
- **Offline support** — Works without internet via localStorage fallback
- **Power chords** — Auto-fills 5th and octave when entering frets
- **Chord picker** — Insert major/minor chord shapes with one click
- **Drop tuning** — Standard and drop tunings with key transposition
- **Print/PDF** — Print-friendly layout for hard copies
- **Dark theme** — Easy on the eyes for late-night sessions
- **Undo/redo** — Full history with Ctrl+Z / Ctrl+Shift+Z
- **Drag selection** — Click and drag to select multiple columns
- **Copy/paste** — Copy column data between positions

## Quick Start

```bash
git clone https://github.com/keithbarney/heavy-tabs.git
cd heavy-tabs
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173). The app works fully offline with localStorage. For cloud features, set up Supabase (see below).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 6 |
| Styling | Sass (SCSS modules) |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | Supabase (Postgres + Auth + RLS) |
| Auth | Magic link + Google OAuth |
| Hosting | Vercel (auto-deploys from GitHub) |
| Analytics | Vercel Web Analytics + custom events |

## Project Structure

```
src/
├── App.tsx                    # Routes and top-level state
├── main.tsx                   # Entry point, session init
├── components/
│   ├── TabEditorNew.tsx       # Main editor (1400 LOC)
│   ├── BarGrid.tsx            # Grid rendering (beats × strings × cells)
│   ├── Part.tsx               # Section container with bars
│   ├── Library.tsx            # Project list sidebar
│   ├── PublicViewer.tsx       # Read-only shared tab view
│   ├── AuthModal.tsx          # Sign-in modal
│   ├── ShareModal.tsx         # Share link management
│   ├── PageAdvancedSettings   # Instrument/tuning/time/grid controls
│   ├── PageHeader/Footer      # Layout chrome
│   ├── Ui*.tsx                # Reusable UI components
│   └── WelcomeModal.tsx       # First-visit walkthrough
├── hooks/
│   ├── useAuth.ts             # Auth state (Supabase)
│   ├── useProjects.ts         # CRUD + cloud sync
│   └── useSharing.ts          # Share link management
├── lib/
│   ├── constants.ts           # Tunings, chords, drum kit, keys
│   ├── storage.ts             # localStorage helpers
│   ├── supabase.ts            # Supabase client init
│   └── analytics.ts           # Event tracking
├── types/index.ts             # TypeScript interfaces
└── styles/                    # SCSS tokens, mixins, globals
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` `→` `↑` `↓` | Navigate cells |
| `0-9` | Enter fret number |
| `h` `p` `b` `/` `\` `~` `m` `x` | Techniques (hammer, pull-off, bend, slide, vibrato, mute, dead) |
| `Delete` / `Backspace` | Clear selection |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` / `Ctrl+V` | Copy / paste column |

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Enable Email auth provider; add `http://localhost:5173/auth/callback` to redirect URLs
4. Copy `.env.example` to `.env` and fill in your credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

```bash
npm run dev      # Dev server at localhost:5173
npm run build    # Production build (tsc + vite)
npm run preview  # Preview production build
```

## Database

Three tables with Row Level Security:

- **profiles** — Auto-created on signup, stores display name
- **projects** — User's saved tabs (JSON for sections, tab data, settings)
- **shared_links** — 8-char slug URLs for public sharing with view counts

## Architecture Notes

- **Data format:** `data[beat][string][cell]` — 3D array per bar
- **Cell keys:** `partId-barIndex-beat-row-cell` for selection tracking
- **Offline-first:** All changes hit localStorage first, then sync to Supabase
- **Session init:** `waitForSession()` ensures auth is loaded before React renders
- **Auto-save:** 5-second debounce after any change, saves to local + cloud

## Related

- [BUSINESS.md](./BUSINESS.md) — Competitor analysis, monetization strategy, roadmap
- [TESTING.md](./TESTING.md) — 123 user stories for QA
- [CLAUDE.md](./CLAUDE.md) — AI assistant context for development

## License

MIT
