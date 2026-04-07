import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, Loader2, AlertCircle, Music, ArrowLeft, Eye } from 'lucide-react'
import TabEditor from './TabEditor'
import UiButton from './UiButton'
import Part from './Part'
import { supabaseToLocal, projectToParts, getProjectInstrument } from '@/lib/storage'
import { drumLines, getTuningNotes } from '@/lib/constants'
import type { Project, ShareLink, LocalProject } from '@/types'
import type { UseSharingReturn } from '@/hooks/useSharing'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './PublicViewer.module.scss'

interface PublicViewerProps {
  sharing: UseSharingReturn
  auth: UseAuthReturn
  onShowAuth: () => void
}

export default function PublicViewer({ sharing, auth, onShowAuth }: PublicViewerProps) {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)

  // Stash sharing in a ref so we can call it from the effect without
  // making it a dependency. useSharing returns a new object every render,
  // so including `sharing` in deps caused the effect to re-fire on every
  // render — an infinite loop that hammered Supabase and never resolved.
  const sharingRef = useRef(sharing)
  sharingRef.current = sharing

  useEffect(() => {
    if (!slug) {
      setError('Invalid share link')
      setLoading(false)
      return
    }

    let cancelled = false
    const loadSharedProject = async () => {
      setLoading(true)
      setError(null)

      const result = await sharingRef.current.getSharedProject(slug)
      if (cancelled) return
      if (result) {
        setProject(result.project)
        setShareLink(result.shareLink)
      } else {
        setError(sharingRef.current.error || 'This tab is not available')
      }

      setLoading(false)
    }

    loadSharedProject()
    return () => { cancelled = true }
  }, [slug])

  // Escape key exits practice mode
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (practiceMode && e.key === 'Escape') {
      e.preventDefault()
      setPracticeMode(false)
    }
  }, [practiceMode])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Dynamic document title for shared tabs
  useEffect(() => {
    if (project) {
      document.title = `Heavy Tabs — ${project.project_name || 'Untitled'}`
    }
    return () => { document.title = 'Heavy Tabs — Free Online Guitar, Bass & Drum Tab Editor' }
  }, [project])

  const handleCopyToLibrary = async () => {
    if (!auth.isAuthenticated) {
      onShowAuth()
      return
    }

    if (!project || !shareLink?.allow_copy) return

    setCopying(true)
    const newProjectId = await sharing.copyToLibrary(project)
    setCopying(false)

    if (newProjectId) {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 size={48} className="spinner" />
          <p>Loading tab...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>Tab Not Found</h2>
          <p>{error || 'This tab may have been removed or the link has expired.'}</p>
          <Link to="/" className={styles.homeLink}>
            <ArrowLeft size={16} />
            Go to Heavy Tabs
          </Link>
        </div>
      </div>
    )
  }

  const localProject: LocalProject = supabaseToLocal(project)

  // Practice mode content
  if (practiceMode) {
    return <PublicPracticeView
      localProject={localProject}
      onExit={() => setPracticeMode(false)}
    />
  }

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLeft}>
            <Music size={20} />
            <span>Viewing shared tab</span>
          </div>
          <div className={styles.bannerRight}>
            <button
              className={styles.practiceButton}
              onClick={() => setPracticeMode(true)}
            >
              <Eye size={14} />
              Practice
            </button>
            {shareLink?.allow_copy && (
              <button
                className={styles.copyButton}
                onClick={handleCopyToLibrary}
                disabled={copying || copied}
              >
                {copying ? (
                  <>
                    <Loader2 size={14} className="spinner" />
                    Copying...
                  </>
                ) : copied ? (
                  'Added to library!'
                ) : (
                  <>
                    <Copy size={14} />
                    Copy to my library
                  </>
                )}
              </button>
            )}
            <Link to="/" className={styles.createLink}>
              Create your own
            </Link>
          </div>
        </div>
      </div>

      <TabEditor initialProject={localProject} readOnly />
    </div>
  )
}

// Separate component for practice view to keep hooks clean
function PublicPracticeView({ localProject, onExit }: { localProject: LocalProject; onExit: () => void }) {
  const parts = useMemo(() => projectToParts(localProject), [localProject])
  const { instrument, strings: numStrings } = useMemo(() => getProjectInstrument(localProject), [localProject])

  const stringLabels = useMemo(() => {
    if (instrument === 'drums') return drumLines.map(d => d.name)
    const effectiveTuning = (localProject.tunings?.guitar === 'standard' || localProject.tunings?.guitar === 'drop')
      ? localProject.tunings.guitar : 'standard'
    return getTuningNotes(
      instrument as 'guitar' | 'bass',
      numStrings,
      effectiveTuning,
      (localProject.projectKey || 'E').toUpperCase()
    )
  }, [instrument, numStrings, localProject])

  return (
    <div className={`${styles.container} ${styles.practiceContainer} practiceMode`}>
      <div className={styles.practiceBar}>
        <span className={styles.practiceTitle}>
          {localProject.artistName && <>{localProject.artistName} — </>}
          {localProject.projectName || 'Untitled'}
        </span>
        <UiButton variant="secondary" selected onClick={onExit} title="Exit practice mode (Esc)">
          <Eye size={16} />
        </UiButton>
      </div>

      <main className={styles.practiceContent}>
        {parts.map(part => (
          <Part
            key={part.id}
            title={part.title}
            notes={part.notes}
            stringLabels={stringLabels}
            readOnly
            bars={part.bars}
          />
        ))}
      </main>
    </div>
  )
}
