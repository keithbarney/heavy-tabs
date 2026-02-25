import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, RefreshCw } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './UpgradeSuccess.module.scss'

interface UpgradeSuccessProps {
  auth: UseAuthReturn
}

const MAX_POLL_ATTEMPTS = 15 // 30 seconds total (15 × 2s)

export default function UpgradeSuccess({ auth }: UpgradeSuccessProps) {
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  const pollCount = useRef(0)

  useEffect(() => {
    // Already Pro on mount (e.g. page refresh after upgrade)
    if (auth.user?.isPro) {
      setVerified(true)
      trackEvent('upgrade_success')
      return
    }

    // Poll for Pro status every 2 seconds
    const interval = setInterval(async () => {
      pollCount.current++
      await auth.refreshProStatus()

      if (pollCount.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval)
        trackEvent('upgrade_poll_timeout')
        // Still redirect — the webhook may just be slow
        setVerified(true)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Watch for isPro becoming true from polling
  useEffect(() => {
    if (auth.user?.isPro && !verified) {
      setVerified(true)
      trackEvent('upgrade_success')
    }
  }, [auth.user?.isPro, verified])

  // Redirect to editor after showing success
  useEffect(() => {
    if (!verified) return
    const timer = setTimeout(() => navigate('/'), 2500)
    return () => clearTimeout(timer)
  }, [verified, navigate])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {verified ? (
          <>
            <div className={styles.iconCircle}>
              <CheckCircle size={32} />
            </div>
            <h1 className={styles.title}>You're all set!</h1>
            <p className={styles.description}>
              Unlimited tabs unlocked. Redirecting to the editor…
            </p>
          </>
        ) : (
          <>
            <div className={styles.spinnerCircle}>
              <RefreshCw size={24} className={styles.spinner} />
            </div>
            <h1 className={styles.title}>Verifying payment…</h1>
            <p className={styles.description}>
              This usually takes just a moment.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
