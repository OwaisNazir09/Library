import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-6">

          <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-14 shadow-2xl shadow-slate-900/5 border border-slate-100 text-center transition-all duration-300">

            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-rose-100 to-red-100 rounded-3xl flex items-center justify-center text-rose-600 shadow-lg">
              <AlertTriangle size={42} />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Something went wrong
            </h1>

            {/* Description */}
            <p className="text-slate-500 leading-relaxed mb-10 font-medium">
              We encountered an unexpected error while rendering this page.
              Our system has logged the issue and our team is working to fix it.
            </p>

            {/* Buttons */}
            <div className="flex gap-4">

              {/* Reload */}
              <button
                onClick={this.handleReload}
                className="flex-1 bg-[#044343] hover:bg-[#033535] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/10 hover:scale-[1.02]"
              >
                <RefreshCw size={18} />
                Reload App
              </button>

              {/* Home */}
              <button
                onClick={this.handleHome}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Home size={18} />
                Go Home
              </button>

            </div>

            {/* Footer */}
            <div className="mt-10 text-xs text-slate-400 font-medium">
              Bookary • Library Management System
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;