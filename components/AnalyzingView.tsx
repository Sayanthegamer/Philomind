import React from 'react';
import { GlassCard } from './GlassCard';

export const AnalyzingView: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <GlassCard className="max-w-md w-full text-center py-12 animate-scale-in">
                <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-philo-navy-700/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-philo-amber-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 bg-philo-amber-400/20 rounded-full animate-pulse-slow backdrop-blur-sm"></div>
                </div>

                <h2 className="serif text-3xl text-white mb-4 animate-pulse-slow">Analyzing Psyche...</h2>
                <p className="text-slate-300 font-light">Consulting the ancient texts...</p>
            </GlassCard>
        </div>
    );
};
