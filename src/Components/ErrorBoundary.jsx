import React from "react";
import { motion } from "framer-motion";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // dump the error info to console so i can fix it later
    console.error("uncaught error:", error, errorInfo);
    console.error("error stack:", error?.stack);
    console.error("component stack:", errorInfo?.componentStack);

    // maybe i'll add sentry here someday but who has money for that lol
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/90 backdrop-blur-lg p-8 rounded-2xl border border-purple-500/20 max-w-md"
          >
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-6">
              something broke bad 💀 try refreshing or something idk
            </p>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            >
              try turning it off and on again
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
