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

// Promise that resolves when Supabase has loaded session from storage
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

    // Wait for Supabase to load session from localStorage
    supabase.auth.getSession().then(() => {
      sessionInitialized = true
      resolve()
    })
  })

  return initPromise
}
