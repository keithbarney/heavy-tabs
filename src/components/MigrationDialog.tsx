import { useState } from 'react'
import { Cloud, HardDrive, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getLocalProjects } from '@/lib/storage'
import type { UseProjectsReturn } from '@/hooks/useProjects'
import styles from './MigrationDialog.module.scss'

interface MigrationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSkip: () => void
  projects: UseProjectsReturn
}

type Step = 'prompt' | 'migrating' | 'complete' | 'error'

export default function MigrationDialog({ isOpen, onClose, onSkip, projects }: MigrationDialogProps) {
  const [step, setStep] = useState<Step>('prompt')
  const [result, setResult] = useState<{ migrated: number; failed: number } | null>(null)

  if (!isOpen) return null

  const localProjects = getLocalProjects()

  const handleMigrate = async () => {
    setStep('migrating')
    try {
      const migrationResult = await projects.migrateLocalProjects()
      setResult(migrationResult)
      setStep('complete')
    } catch (err) {
      console.error('Migration failed:', err)
      setStep('error')
    }
  }

  const handleComplete = () => {
    setResult(null)
    setStep('prompt')
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {step === 'prompt' && (
          <>
            <div className={styles.header}>
              <div className={styles.iconRow}>
                <div className={styles.iconBox}>
                  <HardDrive size={24} />
                </div>
                <ArrowRight size={20} className={styles.arrow} />
                <div className={styles.iconBox}>
                  <Cloud size={24} />
                </div>
              </div>
              <h2>Import Your Projects</h2>
              <p>
                We found <strong>{localProjects.length} project{localProjects.length !== 1 ? 's' : ''}</strong> saved on this device.
                Would you like to import them to the cloud?
              </p>
            </div>

            <ul className={styles.benefits}>
              <li>
                <CheckCircle size={16} />
                Access your tabs from any device
              </li>
              <li>
                <CheckCircle size={16} />
                Never lose your work
              </li>
              <li>
                <CheckCircle size={16} />
                Share tabs with a link
              </li>
            </ul>

            <div className={styles.actions}>
              <button className={styles.skipButton} onClick={onSkip}>
                Skip for now
              </button>
              <button className={styles.migrateButton} onClick={handleMigrate}>
                Import to cloud
              </button>
            </div>
          </>
        )}

        {step === 'migrating' && (
          <div className={styles.migrating}>
            <Loader2 size={48} className="spinner" />
            <h2>Importing Projects</h2>
            <p>This will only take a moment...</p>
          </div>
        )}

        {step === 'complete' && result && (
          <div className={styles.complete}>
            <CheckCircle size={48} className={styles.successIcon} />
            <h2>Import Complete</h2>
            <p>
              Successfully imported <strong>{result.migrated}</strong> project{result.migrated !== 1 ? 's' : ''}.
              {result.failed > 0 && (
                <><br /><span className={styles.errorText}>{result.failed} project{result.failed !== 1 ? 's' : ''} could not be imported.</span></>
              )}
            </p>
            <button className={styles.migrateButton} onClick={handleComplete}>
              Done
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.error}>
            <XCircle size={48} className={styles.errorIcon} />
            <h2>Import Failed</h2>
            <p>Something went wrong. Your local projects are safe and unchanged.</p>
            <div className={styles.actions}>
              <button className={styles.skipButton} onClick={handleComplete}>
                Close
              </button>
              <button className={styles.migrateButton} onClick={handleMigrate}>
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
