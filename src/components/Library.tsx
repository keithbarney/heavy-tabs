import { useState, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, X, LogIn, LogOut, Cloud } from 'lucide-react'
import UiButton from './UiButton'
import type { LocalProject } from '@/types'
import type { UseProjectsReturn } from '@/hooks/useProjects'
import type { UseAuthReturn } from '@/hooks/useAuth'
import styles from './Library.module.scss'

interface LibraryProps {
  isOpen: boolean
  onClose: () => void
  projects: UseProjectsReturn
  currentProjectId: string | null
  onSelectProject: (project: LocalProject) => void
  onNewProject: () => void
  onSignIn: () => void
  auth: UseAuthReturn
  message?: string | null
}

export default function Library({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onSignIn,
  auth,
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

  if (!isOpen && !isClosing) return null

  const handleDelete = async (projectId: string) => {
    await projects.deleteProject(projectId)
    setConfirmDelete(null)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.overlayClosing : ''}`} onClick={handleClose}>
      <div className={`${styles.panel} ${isClosing ? styles.panelClosing : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {auth.isAuthenticated ? (
              <div className={styles.authStatus}>
                <Cloud size={14} />
                <span>{auth.user?.email}</span>
              </div>
            ) : (
              <UiButton variant="ghost" size="small" onClick={() => {
                sessionStorage.setItem('authReturnTo', window.location.pathname)
                onSignIn()
                handleClose()
              }}>
                <LogIn size={14} />
                Sign In
              </UiButton>
            )}
          </div>
          <div className={styles.headerRight}>
            <UiButton variant="action" onClick={() => { onNewProject(); handleClose() }}>
              <Plus size={16} />
              New Song
            </UiButton>
            <UiButton variant="secondary" onClick={handleClose} title="Close">
              <X size={16} />
            </UiButton>
          </div>
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
          ) : (
            projects.projects.map(project => (
              <div
                key={project.cloudId || project.id}
                className={`${styles.projectCard} ${project.id === currentProjectId ? styles.active : ''}`}
              >
                <div className={styles.projectInfo} onClick={() => { onSelectProject(project); handleClose() }}>
                  <h3>{project.projectName}</h3>
                  <div className={styles.projectMeta}>
                    <span>{project.timeSignature?.label || '4/4'}</span>
                    <span>{project.bpm || 120} BPM</span>
                    <span>{project.sections?.length || 0} parts</span>
                    {project.updatedAt && <span>{formatDate(project.updatedAt)}</span>}
                  </div>
                </div>

                {confirmDelete === project.id ? (
                  <div className={styles.confirmDelete}>
                    <span>Delete?</span>
                    <UiButton variant="danger" size="small" onClick={() => handleDelete(project.id)}>Yes</UiButton>
                    <UiButton variant="secondary" size="small" onClick={() => setConfirmDelete(null)}>No</UiButton>
                  </div>
                ) : (
                  <UiButton
                    variant="ghost"
                    onClick={() => setConfirmDelete(project.id)}
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </UiButton>
                )}
              </div>
            ))
          )}
        </div>

        {auth.isAuthenticated && (
          <div className={styles.footer}>
            <UiButton variant="ghost" size="small" onClick={() => auth.signOut()}>
              <LogOut size={14} />
              Sign Out
            </UiButton>
          </div>
        )}
      </div>
    </div>
  )
}
