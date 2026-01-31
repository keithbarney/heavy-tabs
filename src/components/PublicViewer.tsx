import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Copy, Loader2, AlertCircle, Music, ArrowLeft } from 'lucide-react'
import TabEditor from './TabEditor'
import { supabaseToLocal } from '@/lib/storage'
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

  useEffect(() => {
    if (!slug) {
      setError('Invalid share link')
      setLoading(false)
      return
    }

    const loadSharedProject = async () => {
      setLoading(true)
      setError(null)

      const result = await sharing.getSharedProject(slug)
      if (result) {
        setProject(result.project)
        setShareLink(result.shareLink)
      } else {
        setError(sharing.error || 'This tab is not available')
      }

      setLoading(false)
    }

    loadSharedProject()
  }, [slug, sharing])

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

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLeft}>
            <Music size={20} />
            <span>Viewing shared tab</span>
          </div>
          <div className={styles.bannerRight}>
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
