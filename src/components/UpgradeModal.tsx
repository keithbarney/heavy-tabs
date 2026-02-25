import { useState, useCallback, useEffect } from 'react'
import { Lock } from 'lucide-react'
import UiButton from './UiButton'
import { FREE_PROJECT_LIMIT } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import styles from './UpgradeModal.module.scss'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  projectCount: number
  isPro?: boolean
}

export default function UpgradeModal({ isOpen, onClose, projectCount, isPro }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = useCallback(async () => {
    trackEvent('upgrade_modal_click')
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        setError('Cloud features not configured')
        return
      }

      const { data, error: fnError } = await supabase.functions.invoke('create-checkout')
      console.log('create-checkout response:', { data, error: fnError })
      if (fnError || !data?.url) {
        console.error('create-checkout failed:', fnError, 'data:', data)
        setError(`Error: ${JSON.stringify(data || fnError?.message || 'Unknown error')}`)
        return
      }

      trackEvent('upgrade_checkout_started')
      window.location.href = data.url
    } catch (err) {
      console.error('Upgrade error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    trackEvent('upgrade_modal_shown')
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [isOpen, onClose])

  if (!isOpen || isPro) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconCircle}>
          <Lock size={28} />
        </div>
        <h2 className={styles.title}>You've hit the free limit</h2>
        <p className={styles.description}>
          Heavy Tabs lets you create up to {FREE_PROJECT_LIMIT} tabs for free. Unlock unlimited tabs with a one-time $10 payment — yours forever.
        </p>
        <div className={styles.count}>
          {projectCount} of {FREE_PROJECT_LIMIT} free tabs used
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <UiButton variant="action" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Loading…' : 'Unlock Unlimited Tabs — $10'}
          </UiButton>
          <UiButton variant="secondary" onClick={onClose}>
            Maybe Later
          </UiButton>
        </div>
      </div>
    </div>
  )
}
