import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Catches render errors so one broken widget never takes down the whole app. */
export class ErrorBoundary extends Component<
  { children: ReactNode; label?: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('BioPlay error boundary caught:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="card flex flex-col items-center gap-3 p-8 text-center">
        <span className="text-5xl" aria-hidden>
          🧫
        </span>
        <h2 className="text-2xl font-extrabold">
          Oops — this {this.props.label ?? 'page'} had a mutation.
        </h2>
        <p className="text-ink-soft">
          Something went wrong while drawing it. Your progress is safe.
        </p>
        <button className="btn-primary" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    );
  }
}
