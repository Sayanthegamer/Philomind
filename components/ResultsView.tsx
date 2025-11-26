import React, { useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { QUESTIONS } from '../constants';
import { GlassCard } from './GlassCard';
import { Quote, Award, RotateCcw, Share2, Twitter, Download, Loader2, Check, Brain } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ResultsViewProps {
  result: AnalysisResult;
  onRetry: () => void;
}

type ShareStage = 'IDLE' | 'GENERATING' | 'READY';

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRetry }) => {
  const [shareStage, setShareStage] = useState<ShareStage>('IDLE');
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Map insights back to original questions for display
  const insightsWithQuestions = result.insights.map(insight => {
    const originalQ = QUESTIONS.find(q => q.id === insight.questionId);
    return { ...insight, originalText: originalQ?.text || "Unknown Question" };
  });

  const generateImageWithTimeout = async (node: HTMLElement, options: any, timeoutMs = 2500): Promise<string> => {
    return Promise.race([
      toPng(node, options),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Image generation timed out")), timeoutMs)
      )
    ]);
  };

  const handlePrepareShare = async () => {
    if (shareStage === 'GENERATING') return;

    setShareStage('GENERATING');

    try {
      if (shareCardRef.current) {
        // Wait a tick to ensure UI is stable
        await new Promise(resolve => setTimeout(resolve, 100));

        const commonOptions = {
          cacheBust: true,
          pixelRatio: 2, // Higher quality for the dedicated card
          quality: 0.95,
          backgroundColor: '#1e293b', // Dark background for share card
        };

        let dataUrl = "";
        try {
          dataUrl = await generateImageWithTimeout(shareCardRef.current, commonOptions);
        } catch (e) {
          console.warn("High-res gen failed, retrying simplified...", e);
          // Fallback
          dataUrl = await generateImageWithTimeout(shareCardRef.current, {
            ...commonOptions,
            skipFonts: true,
            pixelRatio: 1
          }, 1500);
        }

        if (dataUrl) {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          setGeneratedBlob(blob);
          setShareStage('READY');
          return;
        }
      }
    } catch (error) {
      console.error("Generation failed:", error);
    }

    // If we failed to generate, reset so user can try again or just tweet
    setShareStage('IDLE');
  };

  const triggerDownload = () => {
    if (!generatedBlob) return;
    try {
      const url = URL.createObjectURL(generatedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'philosophical-maturity.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const executeShare = async () => {
    if (!generatedBlob) return;

    const file = new File([generatedBlob], 'philosophical-maturity.png', { type: 'image/png' });
    const shareUrl = window.location.href;
    const shareText = `I explored my mind with PhiloMind. Maturity Score: ${result.maturityScore}/100. Persona: ${result.philosophicalPersona}.`;

    if (navigator.share) {
      try {
        const shareDataWithFile: ShareData = {
          title: 'PhiloMind Assessment',
          text: `${shareText}\n\n${shareUrl}`, // URL inside text
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareDataWithFile)) {
          await navigator.share(shareDataWithFile);
        } else {
          // Fallback: If file sharing isn't supported, share just the text and link
          await navigator.share({
            title: 'PhiloMind Assessment',
            text: shareText,
            url: shareUrl
          });
        }
      } catch (err) {
        console.warn("Native share failed/cancelled:", err);
        if (err instanceof Error && err.name !== 'AbortError') {
          triggerDownload();
        }
      }
    } else {
      triggerDownload();
    }
  };

  const handleTwitterShare = () => {
    const shareText = `I explored my mind with PhiloMind. Score: ${result.maturityScore}/100. Persona: ${result.philosophicalPersona}.`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + window.location.href)}`, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 px-4">

      {/* Header Section */}
      <div className="text-center mb-8 animate-fadeInDown">
        <h2 className="serif text-4xl md:text-5xl text-white mb-2 drop-shadow-lg">Analysis Complete</h2>
        <p className="text-slate-300 font-light">Your philosophical portrait has been painted.</p>
      </div>

      {/* Share Actions */}
      <div className="flex flex-col sm:flex-row justify-end mb-6 gap-3 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        {shareStage === 'IDLE' && (
          <button
            onClick={handlePrepareShare}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-philo-navy-700/50 text-philo-amber-400 border border-philo-amber-500/30 hover:bg-philo-navy-700 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all text-sm font-medium backdrop-blur-sm"
          >
            <Share2 size={16} />
            <span>Create Share Card</span>
          </button>
        )}

        {shareStage === 'GENERATING' && (
          <button
            disabled
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-philo-navy-700/50 text-slate-400 cursor-wait transition-all text-sm font-medium border border-white/5"
          >
            <Loader2 size={16} className="animate-spin" />
            <span>Painting Canvas...</span>
          </button>
        )}

        {shareStage === 'READY' && (
          <button
            onClick={executeShare}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-philo-amber-500 text-philo-navy-900 hover:bg-philo-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all text-sm font-medium animate-pulse-slow font-bold"
          >
            {navigator.share ? <Share2 size={16} /> : <Download size={16} />}
            <span>{navigator.share ? "Share Now" : "Download Image"}</span>
          </button>
        )}

        <button
          onClick={handleTwitterShare}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full hover:bg-sky-500/20 transition-colors text-sm font-medium"
        >
          <Twitter size={16} />
          <span>Tweet</span>
        </button>
      </div>

      {/* Visible Results (Responsive) */}
      <div className="rounded-2xl p-4 md:p-8 mb-12 bg-white/5 border border-white/10 animate-slide-up-fade backdrop-blur-sm" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Main Score Card */}
          <GlassCard className="col-span-1 md:col-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px] gel-border">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-philo-navy-500 to-philo-amber-500"></div>
            <h3 className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-6">Maturity Rating</h3>
            <div className="relative mb-6">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  className="text-philo-navy-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-philo-amber-500 transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  strokeWidth="8"
                  strokeDasharray={314}
                  strokeDashoffset={314 - (314 * result.maturityScore) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="80"
                  cy="80"
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl serif font-bold text-white">
                {result.maturityScore}
              </span>
            </div>
            <div className="text-philo-amber-200 font-medium px-4 py-1 bg-philo-amber-500/10 border border-philo-amber-500/20 rounded-full text-sm">
              Philosophical Score
            </div>
          </GlassCard>

          {/* Persona Card */}
          <GlassCard className="col-span-1 md:col-span-2 flex flex-col justify-center relative min-h-[300px] gel-border">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-philo-amber-500 to-philo-navy-500"></div>
            <div className="mb-auto mt-4">
              <h3 className="text-slate-400 text-sm uppercase tracking-widest font-semibold mb-2">Your Philosophical Persona</h3>
              <h2 className="serif text-3xl md:text-4xl text-white mb-4 drop-shadow-md">{result.philosophicalPersona}</h2>
              <p className="text-slate-300 leading-relaxed text-lg font-light">
                {result.generalAnalysis}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-philo-amber-500/60 text-xs uppercase tracking-widest">
              <span>PhiloMind Assessment</span>
            </div>
          </GlassCard>

        </div>

        {/* Award Section (Conditional) */}
        {result.hasAward && (
          <div className="mb-4 transform hover:scale-[1.01] transition-transform duration-300">
            <GlassCard className="bg-gradient-to-br from-philo-amber-900/20 to-philo-navy-900/20 border-philo-amber-500/30 text-center py-10 gel-border">
              <div className="flex justify-center mb-4 text-philo-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Award size={64} strokeWidth={1} />
              </div>
              <h3 className="serif text-2xl md:text-3xl text-philo-amber-100 mb-2">Philosophical Award Granted</h3>
              <p className="text-philo-amber-200/60 mb-4 uppercase tracking-widest text-sm font-bold">You have earned</p>
              <div className="inline-block border-y-2 border-philo-amber-500/30 py-2 px-8 bg-philo-amber-500/5">
                <span className="serif text-2xl md:text-4xl text-philo-amber-400 font-bold">{result.awardTitle}</span>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Detailed Insights */}
      <h3 className="serif text-2xl md:text-3xl text-white mb-8 pl-2 border-l-4 border-philo-amber-500 animate-fadeIn" style={{ animationDelay: '500ms' }}>Deep Dive Analysis</h3>

      <div className="space-y-8">
        {insightsWithQuestions.map((item, idx) => (
          <div key={idx} className="animate-slide-up-fade" style={{ animationDelay: `${600 + (idx * 150)}ms` }}>
            <GlassCard hoverEffect className="group gel-border p-4 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Question & Answer Summary */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-philo-navy-700 flex items-center justify-center text-xs font-bold text-philo-amber-400 border border-philo-amber-500/20">
                      {idx + 1}
                    </span>
                    <h4 className="text-slate-400 text-sm uppercase font-semibold tracking-wider">The Inquiry</h4>
                  </div>
                  <p className="font-medium text-slate-200 mb-4 text-lg serif leading-snug">
                    {item.originalText}
                  </p>
                  <div className="pl-4 border-l-2 border-philo-navy-600 mb-4">
                    <p className="text-slate-400 italic text-sm">You: "{item.userAnswerSummary}"</p>
                  </div>
                  <div className="prose prose-invert prose-slate">
                    <p className="text-slate-300 leading-relaxed">
                      {item.philosophicalPerspective}
                    </p>
                  </div>
                </div>

                {/* Quote Section */}
                <div className="md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6">
                  <Quote className="text-philo-amber-500/40 mb-4 transform group-hover:scale-110 transition-transform" size={40} />
                  <p className="serif text-xl text-white italic mb-3 leading-relaxed drop-shadow-md">
                    "{item.relevantQuote}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-philo-amber-500/50"></div>
                    <p className="text-sm font-bold text-philo-amber-400 uppercase tracking-widest">
                      {item.philosopher}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>

      {/* Footer / Restart */}
      <div className="mt-20 text-center animate-fadeIn" style={{ animationDelay: '1000ms' }}>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-philo-amber-400 transition-colors px-6 py-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <RotateCcw size={16} />
          <span>Begin New Journey</span>
        </button>
      </div>

      {/* --- HIDDEN SHARE CARD TEMPLATE --- */}
      <div className="fixed left-[-9999px] top-0 pointer-events-none">
        <div
          ref={shareCardRef}
          className="w-[800px] bg-slate-900 p-12 flex flex-col items-center justify-center text-center relative"
          style={{ height: 'auto', minHeight: '600px' }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-philo-navy-900 to-slate-900"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-philo-navy-500 via-philo-amber-500 to-philo-navy-500"></div>
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-philo-navy-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-philo-amber-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Branding */}
            <div className="flex items-center gap-3 mb-8 opacity-90">
              <Brain className="text-philo-amber-500" size={32} />
              <span className="serif text-3xl text-white tracking-tight">PhiloMind</span>
            </div>

            {/* Score */}
            <div className="mb-8 relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  className="text-philo-navy-800"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="#1e293b"
                  r="65"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-philo-amber-500"
                  strokeWidth="12"
                  strokeDasharray={408}
                  strokeDashoffset={408 - (408 * result.maturityScore) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="65"
                  cx="80"
                  cy="80"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="serif text-5xl font-bold text-white">{result.maturityScore}</span>
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-philo-amber-500 text-philo-navy-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Maturity
              </div>
            </div>

            {/* Persona */}
            <h2 className="serif text-5xl text-white mb-6 leading-tight max-w-2xl drop-shadow-lg">
              {result.philosophicalPersona}
            </h2>

            <p className="text-xl text-slate-300 font-light leading-relaxed max-w-2xl mb-10">
              {result.generalAnalysis}
            </p>

            {/* Award if present */}
            {result.hasAward && (
              <div className="flex items-center gap-4 bg-philo-amber-500/10 border border-philo-amber-500/30 px-8 py-4 rounded-full mb-10 backdrop-blur-md">
                <Award className="text-philo-amber-400" size={28} />
                <span className="text-philo-amber-100 font-serif text-xl">{result.awardTitle}</span>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-white/10 w-full flex justify-between items-center text-slate-500 text-sm uppercase tracking-widest">
              <span>The Mirror of the Soul</span>
              <span>philomind.vercel.app</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};