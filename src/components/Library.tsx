import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Trash2, Search, RefreshCw, X, LogIn, LogOut, Cloud } from 'lucide-react'
import UiButton from './UiButton'
import UiInput from './UiInput'
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
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredProjects = projects.projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <div className={styles.headerTitle}>
            <FolderOpen size={20} />
            <h2>Project Library</h2>
          </div>
          <UiButton variant="secondary" onClick={handleClose} title="Close">
            <X size={20} />
          </UiButton>
        </div>

        <div className={styles.toolbar}>
          <UiButton variant="action" onClick={() => { onNewProject(); handleClose() }}>
            <Plus size={16} />
            New Project
          </UiButton>

          <UiInput
            icon={<Search size={16} />}
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        <div className={styles.projectList}>
          {projects.loading ? (
            <div className={styles.loading}>
              <RefreshCw size={24} className="spinner" />
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className={styles.empty}>
              {searchQuery ? (
                <p>No projects match "{searchQuery}"</p>
              ) : (
                <>
                  <FolderOpen size={48} />
                  <p>No projects yet</p>
                  <UiButton variant="action" onClick={() => { onNewProject(); handleClose() }}>
                    <Plus size={16} />
                    Create your first project
                  </UiButton>
                </>
              )}
            </div>
          ) : (
            filteredProjects.map(project => (
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

        <div className={styles.authFooter}>
          {auth.isAuthenticated ? (
            <>
              <div className={styles.authStatus}>
                <Cloud size={14} />
                <span>{auth.user?.email}</span>
              </div>
              <UiButton variant="ghost" size="small" onClick={() => auth.signOut()}>
                <LogOut size={14} />
                Sign Out
              </UiButton>
            </>
          ) : (
            <div className={styles.signInCta}>
              <p className={styles.signInMessage}>Sign in to sync across devices</p>
              <UiButton variant="primary" className={styles.signInButton} onClick={() => { onSignIn(); handleClose() }}>
                <LogIn size={16} />
                Sign In
              </UiButton>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
