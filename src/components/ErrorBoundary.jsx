import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ Error caught by boundary:", error);
    console.error("Error info:", errorInfo);

    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 px-6">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Return to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Reload Page
              </button>
            </div>
            {import.meta.env.MODE === "development" && (
              <div className="mt-6 p-4 bg-gray-100 rounded text-left">
                <p className="text-sm font-mono text-red-600 break-words">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
