import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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

    // Hard timeout: never let initial getSession leave us stuck in
    // loading: true forever if the refresh token is invalidated and
    // supabase-js hangs on the failed token exchange. onAuthStateChange
    // will still catch up if auth eventually resolves.
    let resolved = false
    const finishWith = (next: AuthState) => {
      if (resolved) return
      resolved = true
      setState(next)
    }
    const timeoutId = setTimeout(() => {
      finishWith({ user: null, loading: false, error: null })
    }, 5000)

    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        clearTimeout(timeoutId)
        if (error) {
          console.error('Auth session error:', error)
          finishWith({ user: null, loading: false, error: error.message })
        } else if (session?.user) {
          const user = await fetchProStatus(buildUser(session.user))
          finishWith({ user, loading: false, error: null })
        } else {
          finishWith({ user: null, loading: false, error: null })
        }
      })
      .catch((err) => {
        console.warn('[useAuth] getSession failed, treating as unauthenticated:', err)
        clearTimeout(timeoutId)
        finishWith({ user: null, loading: false, error: null })
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
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with magic link
  const signInWithMagicLink = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase not configured' }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }

      setState(prev => ({ ...prev, loading: false }))
      trackEvent('sign_in_magic_link')
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
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
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    clearError,
    refreshProStatus,
  }
}

export type UseAuthReturn = ReturnType<typeof useAuth>
