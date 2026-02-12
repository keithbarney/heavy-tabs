import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { inject } from '@vercel/analytics'
import { useAuth } from '@/hooks/useAuth'
import { useSharing } from '@/hooks/useSharing'
import { trackEvent } from '@/lib/analytics'

inject()
import TabEditorNew from '@/components/TabEditorNew'
import StyleGuide from '@/components/StyleGuide'
import AuthModal from '@/components/AuthModal'
import WelcomeModal from '@/components/WelcomeModal'
import PublicViewer from '@/components/PublicViewer'

function App() {
  const auth = useAuth()
  const sharing = useSharing({ user: auth.user })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('heavy-tabs-visited')
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
      returning: !!hasVisited,
    })
    if (!hasVisited && window.location.pathname === '/') {
      setShowWelcome(true)
    }
    if (!hasVisited) localStorage.setItem('heavy-tabs-visited', '1')
  }, [])

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

      {/* Welcome walkthrough for first-time visitors */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

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
