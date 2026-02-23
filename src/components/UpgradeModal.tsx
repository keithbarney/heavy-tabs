import { useCallback, useEffect } from 'react'
import { Lock } from 'lucide-react'
import UiButton from './UiButton'
import { FREE_PROJECT_LIMIT, STRIPE_UPGRADE_URL } from '@/lib/constants'
import { trackEvent } from '@/lib/analytics'
import styles from './UpgradeModal.module.scss'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  projectCount: number
}

export default function UpgradeModal({ isOpen, onClose, projectCount }: UpgradeModalProps) {
  const handleUpgrade = useCallback(() => {
    trackEvent('upgrade_modal_click')
    window.open(STRIPE_UPGRADE_URL, '_blank')
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

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconCircle}>
          <Lock size={28} />
        </div>
        <h2 className={styles.title}>You've hit the free limit</h2>
        <p className={styles.description}>
          Heavy Tabs lets you create up to {FREE_PROJECT_LIMIT} tabs for free. Upgrade to Pro for unlimited tabs — one-time $10 payment, yours forever.
        </p>
        <div className={styles.count}>
          {projectCount} of {FREE_PROJECT_LIMIT} free tabs used
        </div>
        <div className={styles.actions}>
          <UiButton variant="action" onClick={handleUpgrade}>
            Upgrade to Pro — $10
          </UiButton>
          <UiButton variant="secondary" onClick={onClose}>
            Maybe Later
          </UiButton>
        </div>
      </div>
    </div>
  )
}
