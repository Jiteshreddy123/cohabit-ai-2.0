import React from "react";
import { Link } from "react-router-dom";
import { Brain, Users, Building2, ChevronRight, ShieldCheck, Zap } from "lucide-react";

function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 selection:bg-brand-500/30 font-sans flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Building2 size={20} className="text-gray-950" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Cohabit-AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/login" 
            state={{ isRegister: true }}
            className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-16 relative overflow-hidden">
        {/* Abstract background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

        <div className="text-center max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50 text-brand-400 text-xs font-semibold uppercase tracking-widest mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Now Available for Universities
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 mb-6 leading-tight">
            Intelligent Hostel <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500">Allocations.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Revolutionizing hostel accommodations through AI. Extract student personality traits automatically and let our optimization engine eliminate roommate conflicts before they happen.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login"
              state={{ isRegister: true }}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(20,184,166,0.6)]"
            >
              Register Institution <ChevronRight size={20} />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center hover:-translate-y-1"
            >
              Admin Login
            </Link>
            <Link 
              to="/student-login"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-xl font-semibold text-lg transition-all flex items-center justify-center hover:-translate-y-1"
            >
              Student Portal
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl mx-auto w-full z-10">
          <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 hover:-translate-y-2 hover:border-brand-500/30 group">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-colors">
              <Brain size={24} className="text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Personality Extraction</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Conduct automated LLM interviews to extract core traits—sleep schedule, noise tolerance, and sociability without manual surveys.
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 group">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Zap size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">OR-Tools Optimization</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Google's powerful OR-Tools engine solves the bin-packing problem, ensuring optimal roommate compatibility across the entire hostel.
            </p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl hover:bg-gray-800/50 transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/30 group">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
              <Users size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Conflict-Free Living</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Dramatically reduce administrative overhead and room change requests by scientifically matching students with compatible peers.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800/60 py-8 text-center text-gray-500 text-sm mt-auto relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-gray-400" />
          <span>Secure, Enterprise-Grade SaaS for Educational Institutions</span>
        </div>
        <p>© {new Date().getFullYear()} Cohabit-AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
