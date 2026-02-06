import { useState } from 'react'
import { X, Mail, Loader2, CheckCircle } from 'lucide-react'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './AuthModal.module.scss'

// Google "G" logo SVG (Lucide doesn't have brand icons)
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  auth: UseAuthReturn
}

type Step = 'email' | 'sent' | 'error'

export default function AuthModal({ isOpen, onClose, auth }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await auth.signInWithMagicLink(email.trim())
    setIsSubmitting(false)

    if (result.success) {
      setStep('sent')
    } else {
      setStep('error')
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleError(null)
    const result = await auth.signInWithGoogle()
    if (!result.success) {
      setGoogleError(result.error || 'Failed to sign in with Google')
    }
    // On success, the page will redirect to Google
  }

  const handleClose = () => {
    setEmail('')
    setStep('email')
    setGoogleError(null)
    auth.clearError()
    onClose()
  }

  const handleTryAgain = () => {
    setStep('email')
    setGoogleError(null)
    auth.clearError()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} title="Close">
          <X size={20} />
        </button>

        {step === 'email' && (
          <>
            <div className={styles.header}>
              <h2>Sign in or create account</h2>
              <p>Save your tabs to the cloud and access them from any device.</p>
            </div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {googleError && (
              <p className={styles.googleError}>{googleError}</p>
            )}

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={!email.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send magic link
                  </>
                )}
              </button>
            </form>

            <p className={styles.terms}>
              By signing in, you agree to save your projects to the cloud and access them from any device.
            </p>
          </>
        )}

        {step === 'sent' && (
          <div className={styles.success}>
            <CheckCircle size={48} className={styles.successIcon} />
            <h2>Check your email</h2>
            <p>
              We sent a magic link to <strong>{email}</strong>. Click the link to sign in or create your account.
            </p>
            <p className={styles.hint}>
              Didn't receive it? Check your spam folder or{' '}
              <button className={styles.linkButton} onClick={handleTryAgain}>
                try again
              </button>
              .
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.error}>
            <h2>Something went wrong</h2>
            <p>{auth.error || 'Unable to send magic link. Please try again.'}</p>
            <button className={styles.submitButton} onClick={handleTryAgain}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
