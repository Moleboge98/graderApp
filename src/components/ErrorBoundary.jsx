import React, { Component } from 'react';

class ErrorBoundary extends Component {
    state = { error: null, errorInfo: null };

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { error: error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.setState({ errorInfo: errorInfo });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.error) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-lg max-w-md w-full">
                        <strong className="font-bold block mb-2 text-lg">Application Error</strong>
                        <p className="mb-3 text-sm">
                            {this.state.error.toString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            We're sorry, something went wrong. Please try refreshing the page.
                        </p>
                        {this.state.errorInfo && (
                            <details className="text-left text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                                <summary className="cursor-pointer font-medium">Error Details</summary>
                                <pre className="mt-1 whitespace-pre-wrap break-all">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all"
                        aria-label="Refresh application page"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
