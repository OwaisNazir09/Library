import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] p-6 font-sans">
          <div className="max-w-[500px] w-full bg-white p-16 rounded-[3.5rem] shadow-2xl shadow-rose-900/5 border border-rose-100 text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-10 text-rose-600">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Something Went Wrong</h1>
            <p className="text-slate-400 font-medium mb-12">
              The interface encountered a critical failure. This has been logged and we're looking into it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#044343] text-white font-black py-5 rounded-3xl shadow-xl shadow-teal-900/10 flex items-center justify-center gap-3 hover:scale-105 transition-all"
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
