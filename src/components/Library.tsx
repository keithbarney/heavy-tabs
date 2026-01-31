import { useState } from 'react'
import { FolderOpen, Plus, Trash2, Search, RefreshCw, Cloud, HardDrive, X, Square, CheckSquare, AlertTriangle } from 'lucide-react'
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
  isAuthenticated: boolean
  message?: string | null
}

export default function Library({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  isAuthenticated,
  message,
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const filteredProjects = projects.projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (projectId: string) => {
    await projects.deleteProject(projectId)
    setConfirmDelete(null)
  }

  const handleRefresh = () => {
    projects.refresh()
  }

  // Selection handlers
  const toggleSelect = (key: string) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedProjects(newSelected)
  }

  // Use cloudId for selection if available (guaranteed unique), otherwise fallback to id
  const getSelectionKey = (project: LocalProject) => project.cloudId || project.id

  const toggleSelectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set())
    } else {
      // Get all valid project keys
      const allKeys = filteredProjects
        .map(getSelectionKey)
        .filter((key): key is string => Boolean(key))
      setSelectedProjects(new Set(allKeys))
    }
  }

  const clearSelection = () => {
    setSelectedProjects(new Set())
  }

  const handleBulkDelete = async () => {
    setIsDeleting(true)
    try {
      // Collect all cloudIds to delete (selection keys are cloudIds)
      const cloudIds = Array.from(selectedProjects).filter((key): key is string => Boolean(key))

      // Use bulk delete for efficiency
      const result = await projects.bulkDeleteByCloudIds(cloudIds)

      if (!result.success) {
        console.error('Bulk delete failed:', result.error)
      }

      setSelectedProjects(new Set())
      setShowBulkDeleteModal(false)
    } catch (error) {
      console.error('Bulk delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const isAllSelected = filteredProjects.length > 0 && selectedProjects.size === filteredProjects.length
  const hasSelection = selectedProjects.size > 0

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FolderOpen size={20} />
            <h2>Project Library</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.toolbar}>
          <button className={styles.newButton} onClick={() => { onNewProject(); onClose() }}>
            <Plus size={16} />
            New Project
          </button>

          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button className={styles.iconButton} onClick={handleRefresh} disabled={projects.loading}>
            <RefreshCw size={16} className={projects.loading ? 'spinner' : ''} />
          </button>
        </div>

        {/* Selection toolbar - shown when projects exist */}
        {filteredProjects.length > 0 && (
          <div className={styles.selectionToolbar}>
            <button
              className={styles.selectAllButton}
              onClick={toggleSelectAll}
              title={isAllSelected ? 'Deselect all' : 'Select all'}
            >
              {isAllSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              <span>{isAllSelected ? 'Deselect all' : 'Select all'}</span>
            </button>

            {hasSelection && (
              <>
                <span className={styles.selectionCount}>
                  {selectedProjects.size} selected
                </span>
                <button
                  className={styles.bulkDeleteButton}
                  onClick={() => setShowBulkDeleteModal(true)}
                >
                  <Trash2 size={16} />
                  Delete selected
                </button>
                <button
                  className={styles.clearSelectionButton}
                  onClick={clearSelection}
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        )}

        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        <div className={styles.storageInfo}>
          {isAuthenticated ? (
            <span className={styles.cloudBadge}>
              <Cloud size={14} />
              Synced to cloud
            </span>
          ) : (
            <span className={styles.localBadge}>
              <HardDrive size={14} />
              Stored locally
            </span>
          )}
          <span className={styles.count}>{filteredProjects.length} projects</span>
        </div>

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
                  <button className={styles.newButton} onClick={() => { onNewProject(); onClose() }}>
                    <Plus size={16} />
                    Create your first project
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredProjects.map(project => {
              const selectionKey = getSelectionKey(project)
              const isSelected = selectedProjects.has(selectionKey)
              return (
              <div
                key={selectionKey}
                className={`${styles.projectCard} ${project.id === currentProjectId ? styles.active : ''} ${isSelected ? styles.selected : ''}`}
              >
                <button
                  className={styles.checkbox}
                  onClick={() => toggleSelect(selectionKey)}
                  title={isSelected ? 'Deselect' : 'Select'}
                >
                  {isSelected ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                </button>

                <div className={styles.projectInfo} onClick={() => { onSelectProject(project); onClose() }}>
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
                    <button className={styles.confirmYes} onClick={() => handleDelete(project.id)}>Yes</button>
                    <button className={styles.confirmNo} onClick={() => setConfirmDelete(null)}>No</button>
                  </div>
                ) : (
                  <button
                    className={styles.deleteButton}
                    onClick={() => setConfirmDelete(project.id)}
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bulk delete confirmation modal */}
      {showBulkDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowBulkDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <AlertTriangle size={24} className={styles.warningIcon} />
              <h3>Delete {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''}?</h3>
            </div>
            <p className={styles.modalBody}>
              This action cannot be undone. {selectedProjects.size === 1
                ? 'This project'
                : `These ${selectedProjects.size} projects`} will be permanently deleted
              {isAuthenticated ? ' from the cloud' : ' from local storage'}.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={styles.deleteConfirmButton}
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={16} className="spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
