import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in component tree:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">Se produjo un error</h2>
          <p className="text-sm text-gray-700 mb-4">Revisa la consola del navegador para más detalles.</p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-100">
            <pre className="text-xs text-red-700 overflow-auto max-h-64">{String(this.state.error && this.state.error.toString())}</pre>
            {this.state.info?.componentStack && (
              <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-64">{this.state.info.componentStack}</pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
