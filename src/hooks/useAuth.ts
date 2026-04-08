import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { withTimeout } from '@/lib/withTimeout'
import { trackEvent } from '@/lib/analytics'
import type { AuthState, User } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Extract user data from Supabase user, including Google metadata
function buildUser(supabaseUser: SupabaseUser): User {
  const metadata = supabaseUser.user_metadata || {}
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    avatarUrl: metadata.avatar_url || metadata.picture,
    displayName: metadata.full_name || metadata.name,
  }
}

// Fetch is_pro from profiles table and merge into user
async function fetchProStatus(user: User): Promise<User> {
  if (!supabase) return user
  const { data } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()
  return { ...user, isPro: data?.is_pro ?? false }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Check for existing session on mount
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setState({ user: null, loading: false, error: null })
      return
    }

    // 5s ceiling so an invalidated refresh token can't strand us in loading: true.
    // onAuthStateChange catches up later if auth eventually resolves.
    const UNAUTH: AuthState = { user: null, loading: false, error: null }
    let cancelled = false
    withTimeout(supabase.auth.getSession(), 5000, { data: { session: null }, error: null } as Awaited<ReturnType<typeof supabase.auth.getSession>>)
      .then(async ({ data: { session }, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Auth session error:', error)
          setState({ ...UNAUTH, error: error.message })
        } else if (session?.user) {
          const user = await fetchProStatus(buildUser(session.user))
          if (cancelled) return
          setState({ user, loading: false, error: null })
        } else {
          setState(UNAUTH)
        }
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await fetchProStatus(buildUser(session.user))
        setState({ user, loading: false, error: null })
      } else {
        setState({ user: null, loading: false, error: null })
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      await supabase.auth.signOut()
      trackEvent('sign_out')
      setState({ user: null, loading: false, error: null })
    } catch (err) {
      console.error('Sign out error:', err)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase not configured' }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      trackEvent('sign_in_google')
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message }
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Re-fetch Pro status (used after Stripe checkout)
  const refreshProStatus = useCallback(async () => {
    if (!state.user) return
    const updated = await fetchProStatus(state.user)
    setState(prev => ({ ...prev, user: updated }))
  }, [state.user])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isSupabaseConfigured: isSupabaseConfigured(),
    signInWithGoogle,
    signOut,
    clearError,
    refreshProStatus,
  }
}

export type UseAuthReturn = ReturnType<typeof useAuth>
