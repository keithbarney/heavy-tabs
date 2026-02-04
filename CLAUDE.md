# Heavy Tabs

Guitar/bass/drum tablature editor with cloud sync and public sharing.

**Repo:** github.com/keithbarney/heavy-tabs
**Domain:** heavytabs.app
**Live:** Deployed on Vercel (auto-deploys from main)

---

## Current Status

### Complete
- ✅ Tab editor (guitar, bass, drums)
- ✅ Cloud sync with Supabase
- ✅ Magic link authentication
- ✅ Public sharing via slug URLs
- ✅ Project library with search and bulk delete
- ✅ Offline support (localStorage fallback)
- ✅ Playback with click track
- ✅ Light/dark theme
- ✅ Mobile-friendly input modal

### Complete (Recent)
- ✅ Custom domain (heavytabs.app) on Vercel
- ✅ SendGrid email authentication (SPF/DKIM verified)
- ✅ Custom magic link email template (light theme)
- ✅ Supabase sender: noreply@heavytabs.app
- ✅ New UI component system (UiButton, UiInput, UiSelect, UiCheckbox)
- ✅ TabEditorNew — redesigned editor at `/new` with full functionality
- ✅ Reusable Part and BarGrid components
- ✅ Style guide at `/styleguide`
- ✅ Comprehensive TESTING.md (123 user stories)

### In Progress
- 🔄 TabEditorNew replacing TabEditor (preview at `/new`, production at `/`)

### Next Priorities
1. Promote TabEditorNew to `/` route (replace old TabEditor)
2. Landing page for conversions
3. Payment integration (Lemon Squeezy or Stripe)
4. PDF export
5. Get feedback from initial users

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
| Hosting | Vercel (deployed, auto-deploys from GitHub) |

---

## Project Structure

```
heavy-tabs/
├── src/
│   ├── App.tsx                        # Main app with routing
│   ├── components/
│   │   ├── TabEditor.tsx              # Original editor (production at /)
│   │   ├── TabEditorNew.tsx           # Redesigned editor (preview at /new)
│   │   ├── BarGrid.tsx                # Grid cell/row/bar components
│   │   ├── Part.tsx                   # Part container (title, bars, string labels)
│   │   ├── PageAdvancedSettings.tsx   # Settings panel (instrument, tuning, key, time, grid)
│   │   ├── PageFooter.tsx             # Fixed footer with legend
│   │   ├── PageHeader.tsx             # Header bar
│   │   ├── UiButton.tsx               # Button component (primary, secondary, action, danger)
│   │   ├── UiInput.tsx                # Text input with optional icon
│   │   ├── UiSelect.tsx               # Select dropdown
│   │   ├── UiCheckbox.tsx             # Checkbox (button-based with icon)
│   │   ├── StyleGuide.tsx             # Component showcase at /styleguide
│   │   ├── AuthModal.tsx              # Magic link sign in
│   │   ├── Library.tsx                # Project list drawer
│   │   ├── MigrationDialog.tsx        # Import localStorage → cloud
│   │   ├── ShareModal.tsx             # Share link management
│   │   ├── PublicViewer.tsx           # Read-only shared view
│   │   ├── UserMenu.tsx               # Account dropdown
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth state + methods
│   │   ├── useProjects.ts             # CRUD, sync, migration
│   │   └── useSharing.ts              # Share link management
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client
│   │   ├── storage.ts                 # localStorage helpers
│   │   └── constants.ts               # Tunings, chords, themes
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   └── styles/
│       ├── _tokens.scss               # Design tokens
│       ├── _mixins.scss               # Button, input, responsive mixins
│       └── main.scss                  # Global styles
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema + RLS
├── TESTING.md                         # 123 user stories for QA
├── .env                               # Supabase credentials (not committed)
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

### UI Components (New System)
Shared components in `src/components/Ui*.tsx`:
- `UiButton` — variants: primary, secondary, action, danger; sizes: small, default
- `UiInput` — text input with optional leading icon; `border: 1px solid transparent` prevents layout shift on focus
- `UiSelect` — select dropdown with label
- `UiCheckbox` — button-based with CheckSquare/Square icons, `role="checkbox"` + `aria-checked`

### Button Styling (Old System)
All buttons use `@include button-base` which provides:
- 5% white background (10% on hover)
- Consistent padding and border-radius
- `button-primary` for accent-colored actions
- `button-danger` for destructive actions
- Add buttons use green (`$color-green`) with solid border

### BarGrid Data Structure
- `data: string[][][]` = `[beat][row/string][cell]`
- Cell key format: `partId-barIndex-beat-row-cell` (5-part string)
- Full column selection: clicking a cell selects all rows (strings) at that beat+cell position

### Inline Editable Fields
Most input fields show as text until clicked:
- Project name, BPM, section name, lyrics, bars count, repeat count
- Single-click to edit, Enter or blur to save
- Uses `editingField` state and `editingFieldValue` pattern

### Cell Selection
- Click/drag selects full columns (all strings at a position)
- Selection persists until clicking away
- `user-select: none` prevents browser text selection while dragging

### Power Chord Mode
- Entering a fret auto-fills 5th (fret+2) and octave on adjacent strings
- Drop tuning variant adjusts intervals

### Fixed Footer
- Legend bar fixed to bottom of screen
- Legend panel opens upward as overlay
- Main content has bottom padding to account for footer

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
| `/` | MainView → TabEditor | Production editor |
| `/new` | TabEditorNew | Redesigned editor (preview) |
| `/styleguide` | StyleGuide | UI component showcase |
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

---

## Bug Fixing Workflow

When I report a bug, don't start by trying to fix it. Instead, start by writing a test that reproduces the bug. Then have sub agents try to fix the bug and prove it with a passing test.

---

## Monetization Plan

**Model:** Lifetime purchase ($29)
- Free: 3 projects, no sharing
- Paid: Unlimited projects, cloud sync, sharing

**Target users:** Hobbyist guitarists, band members, music teachers

**Launch strategy:**
1. ~~Fix email deliverability~~ ✅ Done
2. Create landing page
3. Add payment gate (Lemon Squeezy)
4. Post on Reddit (r/guitar, r/Bass), guitar Discord servers
5. SEO for "free tab editor", "online tab maker"
