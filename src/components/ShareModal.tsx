import { useState, useEffect } from 'react'
import { Share2, Link2, Copy, Check, Trash2, X, Eye, ExternalLink, Loader2 } from 'lucide-react'
import type { ShareLink } from '@/types'
import type { UseSharingReturn } from '@/hooks/useSharing'
import styles from './ShareModal.module.scss'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  sharing: UseSharingReturn
}

export default function ShareModal({ isOpen, onClose, projectId, projectName, sharing }: ShareModalProps) {
  const [links, setLinks] = useState<ShareLink[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Load existing share links
  useEffect(() => {
    if (isOpen) {
      sharing.getShareLinks(projectId).then(setLinks)
    }
  }, [isOpen, projectId, sharing])

  if (!isOpen) return null

  const handleCreateLink = async () => {
    setCreating(true)
    const newLink = await sharing.createShareLink(projectId)
    if (newLink) {
      setLinks(prev => [newLink, ...prev.filter(l => l.id !== newLink.id)])
    }
    setCreating(false)
  }

  const handleRevokeLink = async (linkId: string) => {
    const success = await sharing.revokeShareLink(linkId)
    if (success) {
      setLinks(prev => prev.map(l => l.id === linkId ? { ...l, is_active: false } : l))
    }
  }

  const handleCopyLink = async (slug: string, linkId: string) => {
    const url = `${window.location.origin}/tab/${slug}`
    await navigator.clipboard.writeText(url)
    setCopiedId(linkId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getShareUrl = (slug: string) => `${window.location.origin}/tab/${slug}`

  const activeLinks = links.filter(l => l.is_active)
  const revokedLinks = links.filter(l => !l.is_active)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Share2 size={20} />
            <h2>Share "{projectName}"</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {activeLinks.length === 0 ? (
            <div className={styles.empty}>
              <Link2 size={32} />
              <p>Create a share link to let anyone view this tab.</p>
            </div>
          ) : (
            <div className={styles.linkList}>
              {activeLinks.map(link => (
                <div key={link.id} className={styles.linkCard}>
                  <div className={styles.linkInfo}>
                    <div className={styles.linkUrl}>
                      <Link2 size={14} />
                      <span>{getShareUrl(link.slug)}</span>
                    </div>
                    <div className={styles.linkMeta}>
                      <span><Eye size={12} /> {link.view_count} views</span>
                      <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={styles.linkActions}>
                    <button
                      className={styles.copyButton}
                      onClick={() => handleCopyLink(link.slug, link.id)}
                    >
                      {copiedId === link.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === link.id ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={getShareUrl(link.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.openButton}
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      className={styles.revokeButton}
                      onClick={() => handleRevokeLink(link.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className={styles.createButton}
            onClick={handleCreateLink}
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 size={16} className="spinner" />
                Creating...
              </>
            ) : (
              <>
                <Link2 size={16} />
                {activeLinks.length > 0 ? 'Create another link' : 'Create share link'}
              </>
            )}
          </button>

          {revokedLinks.length > 0 && (
            <div className={styles.revokedSection}>
              <h4>Revoked links</h4>
              <div className={styles.revokedList}>
                {revokedLinks.map(link => (
                  <div key={link.id} className={styles.revokedLink}>
                    <span>{link.slug}</span>
                    <span>{link.view_count} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {sharing.error && (
          <div className={styles.error}>
            {sharing.error}
          </div>
        )}
      </div>
    </div>
  )
}
