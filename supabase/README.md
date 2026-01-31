# Supabase Setup for Heavy Tabs

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New project"
3. Choose your organization
4. Enter project details:
   - **Name:** heavy-tabs (or your preference)
   - **Database Password:** Generate a strong password
   - **Region:** Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready

## 2. Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste into the editor and click "Run"
5. Verify tables were created in **Table Editor**

## 3. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure settings:
   - **Enable email confirmations:** Off (for magic link flow)
   - **Enable email sign ups:** On
4. Go to **Authentication** → **URL Configuration**
5. Add your site URL to **Site URL**: `http://localhost:5173` (for development)
6. Add redirect URLs to **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - Your production URL when ready

## 4. Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## 5. Configure Environment Variables

1. In your Heavy Tabs project, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 6. Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app and click "Sign in"
3. Enter your email and click "Send magic link"
4. Check your email and click the link
5. You should be signed in and see "Synced to cloud"

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Share links allow public read-only access to specific projects
- The anon key is safe to expose in the browser (it's limited by RLS policies)

## Schema Overview

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles, auto-created on signup |
| `projects` | User's tab projects with all data |
| `shared_links` | Public share links for projects |

### Key Policies

- Users can CRUD their own projects
- Anyone can view projects with active share links
- Users can manage their own share links
- View counts are tracked for share links
