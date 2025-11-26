import React from 'react';
import { GlassCard } from './GlassCard';
import { Sparkles } from 'lucide-react';

interface IntroViewProps {
    onStart: () => void;
    loadingError: string | null;
    isTransitioning: boolean;
}

export const IntroView: React.FC<IntroViewProps> = ({ onStart, loadingError, isTransitioning }) => {
    return (
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
                    onClick={onStart}
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
    );
};
