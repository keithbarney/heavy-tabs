import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useSharing } from '@/hooks/useSharing'
import { getLocalProjects } from '@/lib/storage'
import TabEditor from '@/components/TabEditor'
import TabEditorNew from '@/components/TabEditorNew'
import StyleGuide from '@/components/StyleGuide'
import Library from '@/components/Library'
import AuthModal from '@/components/AuthModal'
import MigrationDialog from '@/components/MigrationDialog'
import ShareModal from '@/components/ShareModal'
import PublicViewer from '@/components/PublicViewer'
import UserMenu from '@/components/UserMenu'
import type { LocalProject } from '@/types'

function App() {
  const auth = useAuth()
  const projects = useProjects({ user: auth.user })
  const sharing = useSharing({ user: auth.user })

  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showMigration, setShowMigration] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [currentProject, setCurrentProject] = useState<LocalProject | null>(null)

  // Track if we've tried to load the last project
  const [hasTriedLoadingLastProject, setHasTriedLoadingLastProject] = useState(false)
  const [projectNotFoundMessage, setProjectNotFoundMessage] = useState<string | null>(null)

  // Load last project on startup
  useEffect(() => {
    if (!projects.loading && !hasTriedLoadingLastProject) {
      setHasTriedLoadingLastProject(true)
      const lastProjectId = localStorage.getItem('lastProjectId')

      if (lastProjectId) {
        // Search by both id and cloudId since the stored ID could be either
        const project = projects.projects.find(p => p.id === lastProjectId || p.cloudId === lastProjectId)
        if (project) {
          setCurrentProject(project)
          return
        } else if (projects.projects.length > 0) {
          // Project not found, just load the most recent one silently
          setCurrentProject(projects.projects[0])
          return
        }
      }

      // No last project ID, load most recent if available
      if (projects.projects.length > 0) {
        setCurrentProject(projects.projects[0])
      }
    }
  }, [projects.loading, projects.projects, hasTriedLoadingLastProject])

  // Save current project ID to localStorage (prefer cloudId as it's stable)
  useEffect(() => {
    const idToStore = currentProject?.cloudId || currentProject?.id
    if (idToStore) {
      localStorage.setItem('lastProjectId', idToStore)
    }
  }, [currentProject?.id, currentProject?.cloudId])

  // Check for migration prompt after auth (persisted per user)
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const migrationKey = `migration_seen_${auth.user.id}`
      const hasSeen = localStorage.getItem(migrationKey) === 'true'

      if (!hasSeen) {
        const localProjects = getLocalProjects()
        if (localProjects.length > 0) {
          setShowMigration(true)
        }
        localStorage.setItem(migrationKey, 'true')
      }
    }
  }, [auth.isAuthenticated, auth.user])

  // Handle project selection
  const handleSelectProject = useCallback((project: LocalProject) => {
    setCurrentProject(project)
    setShowLibrary(false)
  }, [])

  // Handle new project
  const handleNewProject = useCallback(() => {
    setCurrentProject(null)
    setShowLibrary(false)
  }, [])

  // Handle project save - returns the saved project with cloudId
  const handleSaveProject = useCallback(async (project: LocalProject) => {
    const result = await projects.saveProject(project)
    const savedProject = result.project || project
    setCurrentProject(savedProject)
    // Explicitly save to localStorage to ensure we remember this project
    const idToStore = savedProject.cloudId || savedProject.id
    if (idToStore) {
      localStorage.setItem('lastProjectId', idToStore)
    }
    // Return result so TabEditor can update its cloudId state
    return result
  }, [projects])

  // Handle project change (for tracking current project ID)
  // Only update if we've already tried loading - prevents overwriting loaded project
  const handleProjectChange = useCallback((project: LocalProject) => {
    if (hasTriedLoadingLastProject) {
      setCurrentProject(project)
    }
  }, [hasTriedLoadingLastProject])

  // Handle share
  const handleShare = useCallback(() => {
    if (!auth.isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    if (currentProject?.id) {
      setShowShareModal(true)
    }
  }, [auth.isAuthenticated, currentProject])

  return (
    <Routes>
      {/* Public shared tab view */}
      <Route
        path="/tab/:slug"
        element={
          <PublicViewer
            sharing={sharing}
            auth={auth}
            onShowAuth={() => setShowAuthModal(true)}
          />
        }
      />

      {/* Auth callback route */}
      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />

      {/* New UI preview */}
      <Route
        path="/new"
        element={<TabEditorNew />}
      />

      {/* Style guide */}
      <Route
        path="/styleguide"
        element={<StyleGuide />}
      />

      {/* Main editor */}
      <Route
        path="*"
        element={
          <MainView
            auth={auth}
            projects={projects}
            sharing={sharing}
            currentProject={currentProject}
            showLibrary={showLibrary}
            showAuthModal={showAuthModal}
            showMigration={showMigration}
            showShareModal={showShareModal}
            projectNotFoundMessage={projectNotFoundMessage}
            onSelectProject={(project) => {
              handleSelectProject(project)
              setProjectNotFoundMessage(null)
            }}
            onNewProject={() => {
              handleNewProject()
              setProjectNotFoundMessage(null)
            }}
            onSaveProject={handleSaveProject}
            onProjectChange={handleProjectChange}
            onShare={handleShare}
            setShowLibrary={setShowLibrary}
            setShowAuthModal={setShowAuthModal}
            setShowMigration={setShowMigration}
            setShowShareModal={setShowShareModal}
          />
        }
      />
    </Routes>
  )
}

// Auth callback handler
function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase handles the callback automatically via onAuthStateChange
    // Just redirect to home after a short delay
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#c0c5ce',
    }}>
      Signing in...
    </div>
  )
}

// Main view with editor
interface MainViewProps {
  auth: ReturnType<typeof useAuth>
  projects: ReturnType<typeof useProjects>
  sharing: ReturnType<typeof useSharing>
  currentProject: LocalProject | null
  showLibrary: boolean
  showAuthModal: boolean
  showMigration: boolean
  showShareModal: boolean
  projectNotFoundMessage: string | null
  onSelectProject: (project: LocalProject) => void
  onNewProject: () => void
  onSaveProject: (project: LocalProject) => Promise<{ project?: LocalProject } | void>
  onProjectChange: (project: LocalProject) => void
  onShare: () => void
  setShowLibrary: (show: boolean) => void
  setShowAuthModal: (show: boolean) => void
  setShowMigration: (show: boolean) => void
  setShowShareModal: (show: boolean) => void
}

function MainView({
  auth,
  projects,
  sharing,
  currentProject,
  showLibrary,
  showAuthModal,
  showMigration,
  showShareModal,
  projectNotFoundMessage,
  onSelectProject,
  onNewProject,
  onSaveProject,
  onProjectChange,
  onShare,
  setShowLibrary,
  setShowAuthModal,
  setShowMigration,
  setShowShareModal,
}: MainViewProps) {
  return (
    <>
      {/* User menu overlay */}
      <UserMenu
        auth={auth}
        onShowLibrary={() => setShowLibrary(true)}
        onShare={onShare}
        canShare={!!currentProject?.id && auth.isAuthenticated}
      />

      {/* Main editor */}
      <TabEditor
        key={currentProject?.id || 'new'}
        initialProject={currentProject}
        onSave={onSaveProject}
        onProjectChange={onProjectChange}
        onOpenLibrary={() => setShowLibrary(true)}
      />

      {/* Modals */}
      <Library
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        projects={projects}
        currentProjectId={currentProject?.id || null}
        onSelectProject={onSelectProject}
        onNewProject={onNewProject}
        onSignIn={() => setShowAuthModal(true)}
        auth={auth}
        message={projectNotFoundMessage}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        auth={auth}
      />

      <MigrationDialog
        isOpen={showMigration}
        onClose={() => setShowMigration(false)}
        onSkip={() => setShowMigration(false)}
        projects={projects}
      />

      {currentProject?.id && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          projectId={currentProject.id}
          projectName={currentProject.projectName}
          sharing={sharing}
        />
      )}
    </>
  )
}

export default App
