import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { Questionnaire } from './components/Questionnaire';
import { ResultsView } from './components/ResultsView';
import { analyzeAnswers } from './services/geminiService';
import { GlassCard } from './components/GlassCard';
import { Sparkles, Brain, Loader2 } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>('INTRO');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Helper to handle smooth exit transitions
  const transitionTo = (newState: AppState, delay = 600) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAppState(newState);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, delay);
  };

  const startJourney = () => {
    transitionTo('QUESTIONNAIRE', 800); // Longer delay for the "void" effect
  };

  const handleCompletion = async (answers: Record<number, string>) => {
    setAppState('ANALYZING');
    setLoadingError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await analyzeAnswers(answers);
      setAnalysisResult(result);
      setAppState('RESULTS');
    } catch (error) {
      console.error(error);
      setLoadingError("The philosophical spirits are silent right now (API Error). Please try again or check your configuration.");
      setAppState('INTRO'); 
    }
  };

  const restart = () => {
    setAnalysisResult(null);
    setLoadingError(null);
    transitionTo('INTRO', 400);
  };

  return (
    // Dynamic soft gradient background
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 bg-[length:400%_400%] animate-gradient-slow overflow-hidden relative">
      
      {/* Abstract blurred blobs for background depth */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center py-10 px-4">
        
        {/* Header - Always visible unless in results (optional choice, but let's keep it clean) */}
        {appState !== 'RESULTS' && (
          <header className={`mb-12 text-center transition-all duration-700 ${isTransitioning ? 'opacity-0 -translate-y-10' : 'animate-fadeInDown'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/40 backdrop-blur-md mb-4 shadow-lg text-indigo-600">
              <Brain size={32} strokeWidth={1.5} />
            </div>
            <h1 className="serif text-5xl md:text-6xl text-slate-800 tracking-tight mb-2">
              PhiloMind
            </h1>
            <p className="text-slate-500 font-light text-lg tracking-wide uppercase">
              The Mirror of the Soul
            </p>
          </header>
        )}

        {/* --- View: Intro --- */}
        {appState === 'INTRO' && (
          <div className={`w-full max-w-lg transition-all duration-800 ease-in-out ${isTransitioning ? 'animate-enter-void' : 'animate-fadeInUp'}`}>
             {loadingError && (
              <div className="mb-6 p-4 bg-red-100/50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {loadingError}
              </div>
            )}
            <GlassCard hoverEffect className="text-center py-12">
              <p className="text-xl text-slate-700 leading-relaxed mb-8 font-light">
                Discover your philosophical maturity. Answer 7 deep questions about life, morality, and self. 
                Receive a tailored analysis of your psyche and wisdom from the ancients to guide your future.
              </p>
              
              <button 
                onClick={startJourney}
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-full overflow-hidden transition-all duration-300 hover:bg-slate-700 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span className="relative z-10 text-lg font-medium tracking-wide">Enter the Void</span>
                <Sparkles size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              
              <div className="mt-8 text-xs text-slate-400 font-medium tracking-widest uppercase">
                Powered by Gemini AI
              </div>
            </GlassCard>
          </div>
        )}

        {/* --- View: Questionnaire --- */}
        {appState === 'QUESTIONNAIRE' && (
          <div className={`${isTransitioning ? 'opacity-0 scale-95' : ''} transition-all duration-500 w-full flex justify-center`}>
            <Questionnaire onComplete={handleCompletion} />
          </div>
        )}

        {/* --- View: Analyzing --- */}
        {appState === 'ANALYZING' && (
          <div className="text-center animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
            <h2 className="serif text-3xl text-slate-700 mb-2">Consulting the Oracles...</h2>
            <p className="text-slate-500 font-light">Parsing your thoughts through the lens of history.</p>
          </div>
        )}

        {/* --- View: Results --- */}
        {appState === 'RESULTS' && analysisResult && (
          <div className={`${isTransitioning ? 'opacity-0 translate-y-10' : 'animate-slide-up-fade'} transition-all duration-700 w-full`}>
            <ResultsView result={analysisResult} onRetry={restart} />
          </div>
        )}

      </main>

      {/* Global CSS for custom animations that Tailwind config might miss without full config file */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-slow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-slow {
          animation: gradient-slow 15s ease infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* New Transition Effects */
        .animate-enter-void {
          animation: enterVoid 0.8s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }
        .animate-slide-up-fade {
          animation: slideUpFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes enterVoid {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); filter: blur(4px); }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}