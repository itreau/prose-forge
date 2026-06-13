import { Component } from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "2rem",
            color: "var(--text-h)",
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Something went wrong</p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}