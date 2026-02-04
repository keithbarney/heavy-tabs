import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { waitForSession } from './lib/supabase'
import './styles/main.scss'

// Check if this is the auth callback BEFORE any React rendering
const isAuthCallback = window.location.pathname === '/auth/callback'

// Lazy load components to ensure clean separation
const AuthCallback = React.lazy(() => import('./components/AuthCallback'))
const App = React.lazy(() => import('./App'))

const LoadingFallback = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#2b303b', color: '#c0c5ce' }}>
    Loading...
  </div>
)

// Render the app after session is ready
function render() {
  const root = document.getElementById('root')
  if (!root) {
    console.error('Root element not found')
    return
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <React.Suspense fallback={LoadingFallback}>
            {isAuthCallback ? <AuthCallback /> : <App />}
          </React.Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  )
}

// Wait for Supabase session, then render
waitForSession().then(render)
