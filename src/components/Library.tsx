import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, Music } from 'lucide-react'
import UiButton from './UiButton'
import DrawerSongListItem from './DrawerSongListItem'
import type { LocalProject } from '@/types'
import type { UseProjectsReturn } from '@/hooks/useProjects'
import styles from './Library.module.scss'

interface LibraryProps {
  isOpen: boolean
  onClose: () => void
  projects: UseProjectsReturn
  currentProjectId: string | null
  onSelectProject: (project: LocalProject) => void
  onNewProject: () => void
  message?: string | null
}

export default function Library({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  message,
}: LibraryProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200) // Match animation duration
  }

  // Reset closing state when opened
  useEffect(() => {
    if (isOpen) setIsClosing(false)
  }, [isOpen])

  // Handle Escape key to close
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  if (!isOpen && !isClosing) return null

  const handleDelete = async (projectId: string) => {
    await projects.deleteProject(projectId)
    setConfirmDelete(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    // Show relative time for recent saves
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    // Show date for older saves
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`} onClick={handleClose}>
      <div className={`${styles.panel} ${isClosing ? styles.panelClosing : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Projects</h2>
          <UiButton variant="action" onClick={() => { onNewProject(); handleClose() }}>
            <Plus size={16} />
            New Song
          </UiButton>
        </div>

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        <div className={styles.projectList}>
          {projects.loading ? (
            <div className={styles.loading}>
              <RefreshCw size={16} className="spinner" />
            </div>
          ) : projects.projects.length === 0 ? (
            <div className={styles.emptyState}>
              <Music size={40} />
              <h3>No tabs yet</h3>
              <p>Create your first tab to start writing music.</p>
              <UiButton variant="action" onClick={() => { onNewProject(); handleClose() }}>
                <Plus size={16} />
                Create your first tab
              </UiButton>
            </div>
          ) : (
            projects.projects.map(project => (
              <DrawerSongListItem
                key={project.cloudId || project.id}
                songName={project.projectName || 'Untitled'}
                updated={formatDate(project.updatedAt)}
                bpm={project.bpm || 120}
                timeSignature={project.timeSignature?.label || '4/4'}
                selected={project.id === currentProjectId}
                onClick={() => { onSelectProject(project); handleClose() }}
                action={
                  confirmDelete === project.id ? (
                    <div className={styles.confirmDelete}>
                      <span>Delete?</span>
                      <UiButton variant="danger" size="small" onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}>Yes</UiButton>
                      <UiButton variant="secondary" size="small" onClick={(e) => { e.stopPropagation(); setConfirmDelete(null) }}>No</UiButton>
                    </div>
                  ) : (
                    <UiButton
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(project.id) }}
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </UiButton>
                  )
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
