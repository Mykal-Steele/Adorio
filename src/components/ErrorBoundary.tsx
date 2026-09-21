'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('uncaught error:', error, errorInfo);
    console.error('error stack:', error?.stack);
    console.error('component stack:', errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="paper-theme flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md -rotate-1 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-8 shadow-[6px_8px_0_var(--paper-ink)]"
          >
            <h2 className="font-paper-serif mb-4 text-2xl font-bold text-[var(--paper-ink)]">
              Something went wrong
            </h2>
            <p className="mb-6 text-[var(--paper-muted)]">
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-4 py-2 font-paper-mono text-sm font-bold uppercase tracking-[.1em] text-[var(--paper-ink)] shadow-[2px_3px_0_var(--paper-ink)] transition-transform hover:-translate-y-px hover:shadow-[2px_5px_0_var(--paper-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--paper-ink)]"
            >
              Reload page
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
