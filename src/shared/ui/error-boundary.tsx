"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-800/50 bg-red-950/20 p-8 text-center">
          <p className="text-lg font-semibold text-red-400">Что-то пошло не так</p>
          <p className="mt-1 text-sm text-slate-500">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
