import { createClient } from '@supabase/supabase-js'
import { withTimeout } from './withTimeout'

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

// Resolves once Supabase has loaded the stored session, with a 5s ceiling
// so an invalidated refresh token can't strand React in a loading state.
let initPromise: Promise<void> | null = null

export function waitForSession(): Promise<void> {
  if (!initPromise) {
    initPromise = supabase
      ? withTimeout(supabase.auth.getSession().then(() => undefined), 5000, undefined)
      : Promise.resolve()
  }
  return initPromise
}
