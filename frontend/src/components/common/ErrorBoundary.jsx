import React from 'react';
import { RefreshCw, Home, ShieldAlert, Cpu, ChevronDown } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical System Error:", error, errorInfo);
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Background Decorative Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/5 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full"></div>
          </div>

          <div className="relative w-full max-w-lg">
            {/* Main Error Card */}
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
              
              {/* Top Status Bar */}
              <div className="h-1.5 w-full bg-rose-500"></div>

              <div className="p-8 sm:p-12">
                {/* Modern Icon Group */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 bg-rose-100 rounded-2xl rotate-6 animate-pulse"></div>
                  <div className="absolute inset-0 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                    <ShieldAlert size={36} />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    System Interrupted
                  </h1>
                  <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed px-2">
                    We encountered a technical glitch while processing this page. Your data remains safe, and we've logged this for review.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={this.handleReload}
                    className="group bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 active:scale-95"
                  >
                    <RefreshCw size={16} className="transition-transform duration-500" />
                    Restart App
                  </button>
                  <button
                    onClick={this.handleHome}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Home size={16} />
                    Go to Dashboard
                  </button>
                </div>

                {/* Technical Toggle */}
                <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center">
                  <button 
                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                    className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-slate-600 transition-colors"
                  >
                    <Cpu size={12} />
                    Technical Details
                    <ChevronDown size={12} className={`transition-transform duration-300 ${this.state.showDetails ? 'rotate-180' : ''}`} />
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-4 w-full bg-slate-50 rounded-lg p-4 font-mono text-[10px] text-slate-500 break-all leading-normal border border-slate-100 overflow-hidden">
                      {this.state.error?.toString() || "Unknown execution context error"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support Footer */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                Welib Cloud Engine
              </div>
              <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                Status: Monitoring
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;