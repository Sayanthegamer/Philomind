import React from 'react';
import { Loader2 } from 'lucide-react';

export const AnalyzingView: React.FC = () => {
    return (
        <div className="text-center animate-pulse">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
            <h2 className="serif text-3xl text-slate-700 mb-2">Consulting the Oracles...</h2>
            <p className="text-slate-500 font-light">Parsing your thoughts through the lens of history.</p>
        </div>
    );
};
