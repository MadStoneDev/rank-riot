"use client";

import { Component, ReactNode } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-[var(--color-score-critical)]/20 bg-[var(--color-score-critical-muted)] text-center">
          <IconAlertTriangle className="h-10 w-10 text-[var(--color-score-critical)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-md">
            An unexpected error occurred in this section. You can try refreshing
            or continue using the rest of the app.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <IconRefresh className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
