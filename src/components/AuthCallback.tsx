import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Get error from hash params (if any)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const errorDescription = hashParams.get('error_description')

      if (errorDescription) {
        setError(errorDescription)
        return
      }

      // Get authorization code from query params
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')

      if (code && supabase) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            setError(exchangeError.message)
            return
          }

          // Wait a moment for localStorage to persist
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to sign in')
          return
        }
      }

      // Success - full page redirect to reset the app state
      // Redirect back to where the user was (stored before auth) or default to /new
      const returnTo = sessionStorage.getItem('authReturnTo') || '/new'
      sessionStorage.removeItem('authReturnTo')
      window.location.href = returnTo
    }

    handleCallback()
  }, [])

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#2b303b',
        color: '#c0c5ce',
        gap: '16px',
      }}>
        <div style={{ color: '#bf616a', fontSize: '18px' }}>Sign in failed</div>
        <div style={{ fontSize: '14px', opacity: 0.7, maxWidth: '400px', textAlign: 'center' }}>{error}</div>
        <button
          onClick={() => { window.location.href = '/' }}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '4px',
            color: '#c0c5ce',
            cursor: 'pointer',
          }}
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#2b303b',
      color: '#c0c5ce',
    }}>
      Signing in...
    </div>
  )
}
