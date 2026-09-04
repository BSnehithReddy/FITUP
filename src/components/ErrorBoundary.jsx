import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { crashlyticsService } from '../services/crashlyticsService';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FITUP Protective Error Boundary caught an error:", error, errorInfo);
    // Report to Firebase Crashlytics
    crashlyticsService.recordError(error, {
      componentStack: errorInfo?.componentStack || '',
      source: 'React.ErrorBoundary'
    }, false);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="glass-panel max-w-lg w-full rounded-3xl border border-vibrantOrange/40 p-8 text-center space-y-6 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="w-16 h-16 rounded-2xl bg-vibrantOrange/10 border border-vibrantOrange/30 text-vibrantOrange flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,85,0,0.3)]">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white font-outfit">
                Dashboard Recovered Safely
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                A temporary data synchronization glitch was safely isolated and reported to Firebase diagnostics. Your credentials and session remain secure.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-gradient-to-r from-electricBlue to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 hover:scale-105 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reload Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
