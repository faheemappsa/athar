import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; errorId: string };

const SAFE_RECOVERY_KEYS = [
  "athar-content",
  "athar-last-shown",
  "athar-daily-intelligence-v1",
  "athar-warm-cache-at",
];

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: "" };

  static getDerivedStateFromError() {
    return { hasError: true, errorId: `ATH-${Date.now().toString(36).toUpperCase()}` };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Athar app error", error, info);
  }

  private reloadHome = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  private repairSession = () => {
    try {
      SAFE_RECOVERY_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {}

    this.reloadHome();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary-bg p-5 font-arabic text-primary-text">
          <div className="mx-auto mt-16 max-w-sm rounded-card bg-white p-6 text-center shadow-xl">
            <p className="text-3xl">🌿</p>
            <h1 className="mt-3 text-xl font-extrabold">تعثر أثر للحظة</h1>
            <p className="mt-2 text-sm leading-relaxed text-secondary-text">
              بياناتك محفوظة. جرّب العودة للرئيسية، وإذا استمر الخلل نصلح الجلسة الحالية فقط بدون مسح اسمك أو تقدمك.
            </p>
            <button onClick={this.reloadHome} className="mt-5 w-full rounded-full bg-action px-6 py-3 font-bold text-white shadow-md shadow-action/20">
              العودة للرئيسية
            </button>
            <button onClick={this.repairSession} className="mt-3 w-full rounded-full bg-primary-bg px-6 py-3 text-sm font-bold text-secondary-text">
              إصلاح الجلسة الحالية
            </button>
            {this.state.errorId && <p className="mt-4 text-[11px] font-semibold text-secondary-text/70">رمز الخلل: {this.state.errorId}</p>}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
