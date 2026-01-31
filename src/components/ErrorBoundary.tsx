import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import styles from './ErrorBoundary.module.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.container}>
          <AlertTriangle size={48} className={styles.icon} />
          <h1>Something went wrong</h1>
          <p>We're sorry, but something unexpected happened. Your data is safe.</p>
          {this.state.error && (
            <pre className={styles.errorMessage}>
              {this.state.error.message}
            </pre>
          )}
          <button className={styles.reloadButton} onClick={this.handleReload}>
            <RefreshCw size={16} />
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
