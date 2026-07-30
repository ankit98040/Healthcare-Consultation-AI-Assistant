"use client"

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-100 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-4 px-6 rounded-2xl glass-panel border border-white/10 mb-16 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-3-3v6m-9 1v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                MediNotes <span className="text-blue-400 font-semibold">Pro</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full uppercase">
                AI Clinical Scribe
              </span>
            </div>
          </div>

          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-xl group-hover:opacity-90 transition-opacity" />
                  <span className="relative block px-5 py-2.5 rounded-[11px] bg-[#0f172a] text-white transition-all duration-200 group-hover:bg-transparent">
                    Sign In
                  </span>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link 
                  href="/product" 
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-medium py-2 px-5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 text-sm flex items-center gap-2"
                >
                  <span>Go to App</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <UserButton showName={true} />
              </div>
            </SignedIn>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center py-12 lg:py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            HIPAA-Ready AI Medical Documentation Assistant
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-8">
            Transform Raw Consultations into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Structured Clinical Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Generate bulletproof physician summaries, actionable follow-ups, and empathetic patient communications directly from your raw clinical notes in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 flex items-center justify-center gap-3">
                  <span>Start Free Clinical Trial</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/product">
                <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 flex items-center justify-center gap-3">
                  <span>Open Consultation Assistant</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-3xl font-extrabold text-blue-400">10x</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-medium">Faster Documentation</p>
            </div>
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-3xl font-extrabold text-emerald-400">99.4%</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-medium">Precision Accuracy</p>
            </div>
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-3xl font-extrabold text-indigo-400">3-in-1</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-medium">Summary, Action & Email</p>
            </div>
            <div className="p-4 rounded-xl glass-card text-center">
              <p className="text-3xl font-extrabold text-teal-400">&lt; 3 sec</p>
              <p className="text-xs text-gray-400 mt-1 uppercase font-medium">AI Generation Time</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left mb-16">
            <div className="relative group p-8 rounded-2xl glass-card border border-white/10 hover:border-blue-500/50">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-6 text-2xl">
                📋
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Physician Summaries</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automatically synthesizes complex patient history, chief complaints, and clinical observations into structured medical records.
              </p>
            </div>

            <div className="relative group p-8 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6 text-2xl">
                ✅
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Actionable Next Steps</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Extracts precise follow-up tasks, lab orders, prescription schedules, and specialist referrals for seamless practice management.
              </p>
            </div>

            <div className="relative group p-8 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/50">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-6 text-2xl">
                💌
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Patient-Friendly Emails</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Drafts empathetic, easy-to-understand consultation emails for patients detailing care instructions and treatment plans.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 MediNotes Pro. Designed for modern healthcare providers.</p>
          <div className="flex gap-6 text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">HIPAA Compliance</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </footer>
      </div>
    </main>
  );
}