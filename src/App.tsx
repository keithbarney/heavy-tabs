import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSharing } from '@/hooks/useSharing'
import TabEditorNew from '@/components/TabEditorNew'
import StyleGuide from '@/components/StyleGuide'
import AuthModal from '@/components/AuthModal'
import PublicViewer from '@/components/PublicViewer'

function App() {
  const auth = useAuth()
  const sharing = useSharing({ user: auth.user })
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
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

        {/* Style guide */}
        <Route
          path="/styleguide"
          element={<StyleGuide />}
        />

        {/* Main editor */}
        <Route
          path="*"
          element={<TabEditorNew />}
        />
      </Routes>

      {/* Auth modal for public viewer */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        auth={auth}
      />
    </>
  )
}

export default App
