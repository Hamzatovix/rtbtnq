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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mistGray/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-inkSoft/60"
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
          <h1 className="text-xl font-light text-inkSoft mb-2">Something went wrong</h1>
          <p className="text-sm text-inkSoft/70 mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-sageTint/90 hover:bg-sageTint text-inkSoft text-sm font-medium rounded-full transition-colors duration-200"
          >
            Try again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 border border-mistGray/60 hover:border-mistGray text-inkSoft/80 text-sm font-medium rounded-full transition-colors duration-200"
          >
            Refresh page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-inkSoft/50 cursor-pointer mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs text-inkSoft/60 bg-mistGray/5 p-3 rounded border overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
