import { useState, useCallback, useEffect } from 'react'
import { Music, Play, Save, Share2 } from 'lucide-react'
import UiButton from './UiButton'
import styles from './WelcomeModal.module.scss'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

const steps = [
  {
    icon: Music,
    title: 'Write tabs in your browser',
    description: 'Click any cell and type fret numbers. Use arrow keys to navigate. Works for guitar, bass, and drums.',
  },
  {
    icon: Play,
    title: 'Hear what you write',
    description: 'Press Space to play back your tab. Adjust speed, enable click track, or add a count-in before playback.',
  },
  {
    icon: Save,
    title: 'Your work is saved',
    description: 'Changes auto-save locally. Sign in to sync across devices and never lose your tabs.',
  },
  {
    icon: Share2,
    title: 'Share with anyone',
    description: 'Generate a share link and send your tabs to bandmates, students, or the world.',
  },
]

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0)

  const handleClose = useCallback(() => {
    setStep(0)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const current = steps[step]
  const Icon = current.icon
  const isLast = step === steps.length - 1

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconCircle}>
          <Icon size={28} />
        </div>
        <h2 className={styles.title}>{current.title}</h2>
        <p className={styles.description}>{current.description}</p>
        <div className={styles.dots}>
          {steps.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i === step ? styles.dotActive : ''}`} />
          ))}
        </div>
        <div className={styles.nav}>
          <div>
            {step > 0 ? (
              <UiButton variant="secondary" onClick={() => setStep(step - 1)}>Back</UiButton>
            ) : (
              <UiButton variant="secondary" onClick={handleClose}>Skip</UiButton>
            )}
          </div>
          <div>
            {isLast ? (
              <UiButton variant="action" onClick={handleClose}>Start Writing</UiButton>
            ) : (
              <UiButton variant="primary" onClick={() => setStep(step + 1)}>Next</UiButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
