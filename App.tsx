import React, { useState, useEffect } from 'react';
import { AppState, AnalysisResult } from './types';
import { Questionnaire } from './components/Questionnaire';
import { ResultsView } from './components/ResultsView';
import { IntroView } from './components/IntroView';
import { AnalyzingView } from './components/AnalyzingView';
import { analyzeAnswers } from './services/geminiService';
import { Brain } from 'lucide-react';

const STORAGE_KEY = 'philomind_state';

interface PersistedState {
  appState: AppState;
  analysisResult: AnalysisResult | null;
  answers: Record<number, string>;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('INTRO');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: PersistedState = JSON.parse(saved);
        if (parsed.appState && parsed.appState !== 'ANALYZING') {
          setAppState(parsed.appState);
          setAnalysisResult(parsed.analysisResult);
          setAnswers(parsed.answers || {});
        }
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state to local storage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;

    // Don't persist 'ANALYZING' state to avoid stuck loading screens on refresh
    const stateToSave: PersistedState = {
      appState: appState === 'ANALYZING' ? 'INTRO' : appState,
      analysisResult,
      answers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [appState, analysisResult, answers, isLoaded]);

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

  const handleCompletion = async (newAnswers: Record<number, string>) => {
    setAnswers(newAnswers);
    setAppState('ANALYZING');
    setLoadingError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await analyzeAnswers(newAnswers);
      setAnalysisResult(result);
      setAppState('RESULTS');
    } catch (error) {
      console.error(error);
      setLoadingError("The philosophical spirits are silent right now (API Error). Please try again or check your configuration.");
      setAppState('INTRO');
    }
  };

  const restart = () => {
    // Clear storage
    localStorage.removeItem(STORAGE_KEY);
    setAnalysisResult(null);
    setAnswers({});
    setLoadingError(null);
    transitionTo('INTRO', 400);
  };

  if (!isLoaded) return null; // Prevent flash of wrong state

  return (
    // Dynamic soft gradient background
    <div className="min-h-screen w-full overflow-hidden relative text-slate-100">

      {/* Abstract blurred blobs for background depth */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-philo-navy-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-philo-amber-600/10 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-philo-navy-700/30 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center py-10 px-4">

        {/* Header - Always visible unless in results or intro (Intro has its own branding) */}
        {appState !== 'RESULTS' && appState !== 'INTRO' && (
          <header className={`mb-12 text-center transition-all duration-700 ${isTransitioning ? 'opacity-0 -translate-y-10' : 'animate-fadeInDown'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-philo-amber-400 border border-white/10">
              <Brain size={32} strokeWidth={1.5} />
            </div>
            <h1 className="serif text-5xl md:text-6xl text-white tracking-tight mb-2 drop-shadow-lg">
              PhiloMind
            </h1>
            <p className="text-slate-400 font-light text-lg tracking-wide uppercase">
              The Mirror of the Soul
            </p>
          </header>
        )}

        {/* --- View: Intro --- */}
        {appState === 'INTRO' && (
          <IntroView
            onStart={startJourney}
            loadingError={loadingError}
            isTransitioning={isTransitioning}
          />
        )}

        {/* --- View: Questionnaire --- */}
        {appState === 'QUESTIONNAIRE' && (
          <div className={`${isTransitioning ? 'opacity-0 scale-95' : ''} transition-all duration-500 w-full flex justify-center`}>
            <Questionnaire onComplete={handleCompletion} />
          </div>
        )}

        {/* --- View: Analyzing --- */}
        {appState === 'ANALYZING' && (
          <AnalyzingView />
        )}

        {/* --- View: Results --- */}
        {appState === 'RESULTS' && analysisResult && (
          <div className={`${isTransitioning ? 'opacity-0 translate-y-10' : 'animate-slide-up-fade'} transition-all duration-700 w-full`}>
            <ResultsView result={analysisResult} onRetry={restart} />
          </div>
        )}

      </main>
    </div>
  );
}