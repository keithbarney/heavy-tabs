import { useState } from 'react'
import { X, Mail, Loader2, CheckCircle } from 'lucide-react'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './AuthModal.module.scss'

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

  const handleClose = () => {
    setEmail('')
    setStep('email')
    auth.clearError()
    onClose()
  }

  const handleTryAgain = () => {
    setStep('email')
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
              <Mail size={32} className={styles.icon} />
              <h2>Sign in or create account</h2>
              <p>Enter your email and we'll send you a magic link. No password needed — new accounts are created automatically.</p>
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
                  autoFocus
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
                  'Send magic link'
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
