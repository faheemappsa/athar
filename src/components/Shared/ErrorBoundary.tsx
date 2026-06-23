import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Athar app error", error, info);
  }

  private resetApp = () => {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("athar-"))
        .forEach((key) => localStorage.removeItem(key));
    } catch {}

    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-bg p-5 font-arabic text-primary-text">
          <div className="mx-auto mt-16 max-w-sm rounded-card bg-white p-6 text-center shadow-xl">
            <p className="text-3xl">🌿</p>
            <h1 className="mt-3 text-xl font-bold">حدث خلل بسيط</h1>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              أعدنا تجهيز أثر لك بدون الحاجة لمسح بيانات المتصفح.
            </p>
            <button
              onClick={this.resetApp}
              className="mt-5 w-full rounded-full bg-action px-6 py-3 font-bold text-white shadow-md"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
