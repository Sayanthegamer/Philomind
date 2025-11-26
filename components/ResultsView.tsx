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
          backgroundColor: '#f8fafc',
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
        <h2 className="serif text-5xl text-slate-800 mb-2">Analysis Complete</h2>
        <p className="text-slate-600 font-light">Your philosophical portrait has been painted.</p>
      </div>

      {/* Share Actions */}
      <div className="flex flex-col sm:flex-row justify-end mb-6 gap-3 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        {shareStage === 'IDLE' && (
          <button
            onClick={handlePrepareShare}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:shadow-sm transition-all text-sm font-medium"
          >
            <Share2 size={16} />
            <span>Create Share Card</span>
          </button>
        )}

        {shareStage === 'GENERATING' && (
          <button
            disabled
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-indigo-50 text-indigo-400 cursor-wait transition-all text-sm font-medium"
          >
            <Loader2 size={16} className="animate-spin" />
            <span>Painting Canvas...</span>
          </button>
        )}

        {shareStage === 'READY' && (
          <button
            onClick={executeShare}
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/30 transition-all text-sm font-medium animate-pulse-slow"
          >
            {navigator.share ? <Share2 size={16} /> : <Download size={16} />}
            <span>{navigator.share ? "Share Now" : "Download Image"}</span>
          </button>
        )}

        <button
          onClick={handleTwitterShare}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-sky-100 text-sky-700 rounded-full hover:bg-sky-200 transition-colors text-sm font-medium"
        >
          <Twitter size={16} />
          <span>Tweet</span>
        </button>
      </div>

      {/* Visible Results (Responsive) */}
      <div className="rounded-2xl p-4 md:p-8 mb-12 bg-white/20 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Main Score Card */}
          <GlassCard className="col-span-1 md:col-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
            <h3 className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-6">Maturity Rating</h3>
            <div className="relative mb-6">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  className="text-slate-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-indigo-500 transition-all duration-1000 ease-out"
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
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl serif font-bold text-slate-700">
                {result.maturityScore}
              </span>
            </div>
            <div className="text-indigo-900 font-medium px-4 py-1 bg-indigo-50 rounded-full text-sm">
              Philosophical Score
            </div>
          </GlassCard>

          {/* Persona Card */}
          <GlassCard className="col-span-1 md:col-span-2 flex flex-col justify-center relative min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-300 to-pink-300"></div>
            <div className="mb-auto mt-4">
              <h3 className="text-slate-500 text-sm uppercase tracking-widest font-semibold mb-2">Your Philosophical Persona</h3>
              <h2 className="serif text-4xl text-slate-800 mb-4">{result.philosophicalPersona}</h2>
              <p className="text-slate-700 leading-relaxed text-lg font-light">
                {result.generalAnalysis}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest">
              <span>PhiloMind Assessment</span>
            </div>
          </GlassCard>

        </div>

        {/* Award Section (Conditional) */}
        {result.hasAward && (
          <div className="mb-4 transform hover:scale-[1.01] transition-transform duration-300">
            <GlassCard className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 border-amber-200/50 text-center py-10">
              <div className="flex justify-center mb-4 text-amber-500">
                <Award size={64} strokeWidth={1} />
              </div>
              <h3 className="serif text-3xl text-amber-800 mb-2">Philosophical Award Granted</h3>
              <p className="text-amber-700/80 mb-4 uppercase tracking-widest text-sm font-bold">You have earned</p>
              <div className="inline-block border-y-2 border-amber-300/50 py-2 px-8">
                <span className="serif text-2xl md:text-4xl text-amber-900 font-bold">{result.awardTitle}</span>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Detailed Insights */}
      <h3 className="serif text-3xl text-slate-800 mb-8 pl-2 border-l-4 border-indigo-300 animate-fadeIn" style={{ animationDelay: '500ms' }}>Deep Dive Analysis</h3>

      <div className="space-y-8">
        {insightsWithQuestions.map((item, idx) => (
          <div key={idx} className="animate-slide-up-fade" style={{ animationDelay: `${600 + (idx * 150)}ms` }}>
            <GlassCard hoverEffect className="group">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Question & Answer Summary */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <h4 className="text-slate-500 text-sm uppercase font-semibold tracking-wider">The Inquiry</h4>
                  </div>
                  <p className="font-medium text-slate-800 mb-4 text-lg serif leading-snug">
                    {item.originalText}
                  </p>
                  <div className="pl-4 border-l-2 border-slate-200 mb-4">
                    <p className="text-slate-500 italic text-sm">You: "{item.userAnswerSummary}"</p>
                  </div>
                  <div className="prose prose-slate">
                    <p className="text-slate-700 leading-relaxed">
                      {item.philosophicalPerspective}
                    </p>
                  </div>
                </div>

                {/* Quote Section */}
                <div className="md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                  <Quote className="text-indigo-200 mb-4 transform group-hover:scale-110 transition-transform" size={40} />
                  <p className="serif text-xl text-slate-800 italic mb-3 leading-relaxed">
                    "{item.relevantQuote}"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-indigo-300"></div>
                    <p className="text-sm font-bold text-indigo-900 uppercase tracking-widest">
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
          className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors px-6 py-3 rounded-full hover:bg-white/50"
        >
          <RotateCcw size={16} />
          <span>Begin New Journey</span>
        </button>
      </div>

      {/* --- HIDDEN SHARE CARD TEMPLATE --- */}
      <div className="absolute top-0 left-0 overflow-hidden pointer-events-none" style={{ width: 0, height: 0 }}>
        <div
          ref={shareCardRef}
          className="w-[800px] bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-12 flex flex-col items-center justify-center text-center relative"
          style={{ height: 'auto', minHeight: '600px' }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl"></div>

          {/* Branding */}
          <div className="flex items-center gap-3 mb-8 opacity-80">
            <Brain className="text-indigo-600" size={32} />
            <span className="serif text-2xl text-slate-700 tracking-tight">PhiloMind</span>
          </div>

          {/* Score */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 rounded-full border-4 border-indigo-100 flex items-center justify-center bg-white shadow-sm">
              <span className="serif text-5xl font-bold text-indigo-600">{result.maturityScore}</span>
            </div>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Maturity
            </div>
          </div>

          {/* Persona */}
          <h2 className="serif text-5xl text-slate-800 mb-4 leading-tight max-w-2xl">
            {result.philosophicalPersona}
          </h2>

          <p className="text-xl text-slate-600 font-light leading-relaxed max-w-2xl mb-10">
            {result.generalAnalysis}
          </p>

          {/* Award if present */}
          {result.hasAward && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 px-6 py-3 rounded-full mb-8">
              <Award className="text-amber-500" size={24} />
              <span className="text-amber-800 font-serif text-lg">{result.awardTitle}</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-8 border-t border-slate-200 w-full flex justify-between items-center text-slate-400 text-sm uppercase tracking-widest">
            <span>The Mirror of the Soul</span>
            <span>philomind.app</span>
          </div>
        </div>
      </div>

    </div>
  );
};