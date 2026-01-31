import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { AuthState } from '@/types'

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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error)
        setState({ user: null, loading: false, error: error.message })
      } else if (session?.user) {
        setState({
          user: { id: session.user.id, email: session.user.email || '' },
          loading: false,
          error: null,
        })
      } else {
        setState({ user: null, loading: false, error: null })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState({
          user: { id: session.user.id, email: session.user.email || '' },
          loading: false,
          error: null,
        })
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
      setState({ user: null, loading: false, error: null })
    } catch (err) {
      console.error('Sign out error:', err)
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    isSupabaseConfigured: isSupabaseConfigured(),
    signInWithMagicLink,
    signOut,
    clearError,
  }
}

export type UseAuthReturn = ReturnType<typeof useAuth>
