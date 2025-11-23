'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-fintage-graphite/10 dark:bg-fintage-graphite/20 border border-fintage-graphite/20 dark:border-fintage-graphite/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-fintage-graphite/60 dark:text-fintage-graphite/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-2 uppercase tracking-tighter">Something went wrong</h1>
          <p className="text-sm text-fintage-graphite/60 dark:text-fintage-graphite/50 mb-6 font-light">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-accent dark:bg-accent hover:brightness-90 dark:hover:brightness-90 text-fintage-offwhite dark:text-fintage-charcoal text-sm font-mono uppercase tracking-[0.15em] rounded-sm transition-fintage shadow-fintage-sm"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 border border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:border-fintage-graphite/50 dark:hover:border-fintage-graphite/60 text-fintage-charcoal dark:text-fintage-offwhite text-sm font-mono uppercase tracking-[0.15em] rounded-sm transition-fintage hover:bg-hover-bg dark:hover:bg-hover-bg"
          >
            Refresh page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-xs font-mono uppercase tracking-[0.15em] text-fintage-graphite/50 dark:text-fintage-graphite/50 cursor-pointer mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs text-fintage-graphite/60 dark:text-fintage-graphite/50 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 p-3 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 overflow-auto font-mono">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
