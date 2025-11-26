import React from 'react';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface IntroViewProps {
    onStart: () => void;
    loadingError?: string | null;
    isTransitioning?: boolean;
}

export const IntroView: React.FC<IntroViewProps> = ({ onStart, loadingError, isTransitioning }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center p-4 relative">

            {/* Background Blobs - Enhanced for Liquid Feel */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-philo-navy-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-philo-amber-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="text-center max-w-2xl z-10 animate-fadeIn">
                <div className="mb-8 flex justify-center animate-float">
                    <div className="p-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl ring-1 ring-white/20">
                        <Brain size={64} className="text-philo-amber-400" />
                    </div>
                </div>

                <h1 className="serif text-5xl md:text-7xl text-white mb-6 tracking-tight drop-shadow-lg">
                    Philo<span className="text-philo-amber-400 font-italic">Mind</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-300 mb-12 font-light leading-relaxed max-w-lg mx-auto">
                    A journey into your philosophical depth. Discover your maturity through the lens of history's greatest thinkers.
                </p>

                {loadingError && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm max-w-md mx-auto">
                        {loadingError}
                    </div>
                )}

                <button
                    onClick={onStart}
                    disabled={isTransitioning}
                    className={`
                        group relative inline-flex items-center gap-3 px-8 py-4 
                        bg-philo-amber-500 hover:bg-philo-amber-400 text-philo-navy-900 
                        rounded-full text-lg font-semibold transition-all duration-300 
                        shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] 
                        hover:-translate-y-1 active:scale-95
                        ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <span>{isTransitioning ? 'Entering Void...' : 'Begin Analysis'}</span>
                    {!isTransitioning && <ArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></div>
                </button>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
                    <GlassCard className="py-4 hover:bg-white/10 transition-colors">
                        <Sparkles className="w-5 h-5 mx-auto mb-2 text-philo-amber-400" />
                        <span className="uppercase tracking-widest text-xs font-bold">AI Powered</span>
                    </GlassCard>
                    <GlassCard className="py-4 hover:bg-white/10 transition-colors">
                        <Brain className="w-5 h-5 mx-auto mb-2 text-philo-amber-400" />
                        <span className="uppercase tracking-widest text-xs font-bold">Deep Insights</span>
                    </GlassCard>
                    <GlassCard className="py-4 hover:bg-white/10 transition-colors">
                        <div className="w-5 h-5 mx-auto mb-2 font-serif italic text-philo-amber-400 text-lg">φ</div>
                        <span className="uppercase tracking-widest text-xs font-bold">Philosophical</span>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
