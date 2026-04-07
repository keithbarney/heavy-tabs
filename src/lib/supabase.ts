import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Cloud features disabled. ' +
    'Copy .env.example to .env and add your Supabase project credentials.'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'heavy-tabs-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const isSupabaseConfigured = () => Boolean(supabase)

// Promise that resolves when Supabase has loaded session from storage.
// Hardened against hangs and rejections so a stale/invalidated refresh
// token can never block the React app from mounting.
let sessionInitialized = false
let initPromise: Promise<void> | null = null

export async function waitForSession(): Promise<void> {
  if (sessionInitialized) return
  if (initPromise) return initPromise

  initPromise = new Promise((resolve) => {
    if (!supabase) {
      sessionInitialized = true
      resolve()
      return
    }

    const finish = () => {
      if (sessionInitialized) return
      sessionInitialized = true
      resolve()
    }

    // Hard timeout: never block render for more than 5s, even if the
    // refresh token is invalidated and supabase-js is hanging on the
    // failed token exchange. The app handles unauthenticated state
    // gracefully and onAuthStateChange will catch up if/when auth resolves.
    const timeoutId = setTimeout(finish, 5000)

    supabase.auth.getSession()
      .then(() => {
        clearTimeout(timeoutId)
        finish()
      })
      .catch((err) => {
        console.warn('[supabase] getSession failed during init, rendering anyway:', err)
        clearTimeout(timeoutId)
        finish()
      })
  })

  return initPromise
}
