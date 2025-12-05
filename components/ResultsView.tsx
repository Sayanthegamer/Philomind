import React, { useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { QUESTIONS } from '../constants';
import { GlassCard } from './GlassCard';
import { Quote, Award, RotateCcw, Share2, Twitter, Download, Loader2, Check, Brain, MessageCircle, Instagram, X } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ResultsViewProps {
  result: AnalysisResult;
  onRetry: () => void;
}

type ShareStage = 'IDLE' | 'GENERATING' | 'READY';
type SocialPlatform = 'X' | 'WHATSAPP' | 'INSTAGRAM';

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRetry }) => {
  const [shareStage, setShareStage] = useState<ShareStage>('IDLE');
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<SocialPlatform | null>(null);
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

  const generateBlob = async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null;

    try {
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
        return blob;
      }
    } catch (error) {
      console.error("Generation failed:", error);
    }
    return null;
  };

  const handlePrepareShare = async () => {
    if (shareStage === 'GENERATING') return;
    setShareStage('GENERATING');
    
    const blob = await generateBlob();
    if (blob) {
      setGeneratedBlob(blob);
      setShareStage('READY');
    } else {
      setShareStage('IDLE');
    }
  };

  const triggerDownload = (blob: Blob) => {
    try {
      const url = URL.createObjectURL(blob);
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
    await shareFile(generatedBlob);
  };

  const shareFile = async (blob: Blob) => {
    const file = new File([blob], 'philosophical-maturity.png', { type: 'image/png' });
    const shareUrl = window.location.href;
    const shareText = `I explored my mind with PhiloMind. Maturity Score: ${result.maturityScore}/100. Persona: ${result.philosophicalPersona}.`;

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'PhiloMind Assessment',
          text: `${shareText}\n\n${shareUrl}`,
          files: [file]
        });
        return true; // Shared successfully via native menu
      } catch (err) {
        console.warn("Native share failed/cancelled:", err);
        if (err instanceof Error && err.name !== 'AbortError') {
           // If it wasn't just cancelled by user, maybe try download?
           // For now, we just return false to let caller handle fallback if needed
        }
      }
    }
    return false; // Native share not supported or failed
  };

  const getShareText = () => `I explored my mind with PhiloMind. Score: ${result.maturityScore}/100. Persona: ${result.philosophicalPersona}.`;

  const handleSmartShare = async (platform: SocialPlatform) => {
    if (generatingFor) return; // Prevent double clicks
    setGeneratingFor(platform);

    // 1. Get or Generate Blob
    let blob = generatedBlob;
    if (!blob) {
      setShareStage('GENERATING');
      blob = await generateBlob();
      if (blob) {
        setGeneratedBlob(blob);
        setShareStage('READY');
      } else {
        setShareStage('IDLE');
        setGeneratingFor(null);
        return; // Failed to generate
      }
    }

    // 2. Try Native Share (Mobile)
    // We only try native share if it supports FILES.
    // If it succeeds, we are done.
    const nativeShareSuccess = await shareFile(blob);
    
    // 3. Desktop Fallback (if native share didn't happen)
    if (!nativeShareSuccess) {
      // Auto-download the image for them
      triggerDownload(blob);

      // Open the specific platform link
      const shareText = getShareText();
      const url = window.location.href;

      if (platform === 'X') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + " " + url)}`, '_blank');
      } else if (platform === 'WHATSAPP') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`, '_blank');
      } else if (platform === 'INSTAGRAM') {
        // Copy text and open Insta
        try {
          await navigator.clipboard.writeText(shareText + " " + url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
          window.open('https://instagram.com', '_blank');
        } catch (err) {
          console.error('Failed to copy text: ', err);
        }
      }
    }

    setGeneratingFor(null);
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

        {shareStage === 'GENERATING' && !generatingFor && (
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

        {/* Social Buttons Group */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSmartShare('X')}
            disabled={!!generatingFor}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black/40 text-white border border-white/20 rounded-full hover:bg-black/60 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-wait"
            title="Post on X"
          >
            {generatingFor === 'X' ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
            <span className="hidden sm:inline">Post</span>
          </button>

          <button
            onClick={() => handleSmartShare('WHATSAPP')}
            disabled={!!generatingFor}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-full hover:bg-green-500/20 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-wait"
            title="Share on WhatsApp"
          >
            {generatingFor === 'WHATSAPP' ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={() => handleSmartShare('INSTAGRAM')}
            disabled={!!generatingFor}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded-full hover:bg-pink-500/20 transition-colors text-sm font-medium relative disabled:opacity-50 disabled:cursor-wait"
            title="Share on Instagram"
          >
            {generatingFor === 'INSTAGRAM' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : copySuccess ? (
              <Check size={16} />
            ) : (
              <Instagram size={16} />
            )}
            <span className="hidden sm:inline">{copySuccess ? "Copied!" : "Instagram"}</span>
          </button>
        </div>
      </div>

      {/* Visible Results (Responsive) */}
      <div className="rounded-2xl p-4 md:p-8 mb-12 bg-white/5 border border-white/10 animate-slide-up-fade backdrop-blur-sm" style={{ animationDelay: '300ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Main Score Card */}
          <GlassCard className="col-span-1 md:col-span-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px] gel-border">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-philo-navy-500 to-philo-amber-500 rounded-t-2xl"></div>
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
          <GlassCard className="col-span-1 md:col-span-2 flex flex-col justify-center relative overflow-hidden min-h-[300px] gel-border">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-philo-amber-500 to-philo-navy-500 rounded-t-2xl"></div>
            <div className="mb-auto mt-6">
              <h3 className="text-slate-400 text-xs md:text-sm uppercase tracking-widest font-semibold mb-3">Your Philosophical Persona</h3>
              <h2 className="serif text-2xl md:text-4xl text-white mb-4 drop-shadow-md leading-tight">{result.philosophicalPersona}</h2>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg font-light">
                {result.generalAnalysis}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-philo-amber-500/60 text-[10px] md:text-xs uppercase tracking-widest">
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
          className="w-[1200px] h-[630px] bg-slate-900 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-philo-navy-900 to-slate-900"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-philo-navy-500 via-philo-amber-500 to-philo-navy-500"></div>
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-philo-navy-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-philo-amber-600/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-16">
            {/* Branding */}
            <div className="flex items-center gap-4 opacity-90">
              <Brain className="text-philo-amber-500" size={48} />
              <span className="serif text-4xl text-white tracking-tight">PhiloMind</span>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl">

              <div className="flex items-center justify-center gap-12 w-full">
                {/* Score Circle */}
                <div className="relative w-48 h-48 flex-shrink-0">
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
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 serif text-6xl font-bold text-white leading-none">{result.maturityScore}</span>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-philo-amber-500 text-philo-navy-900 text-sm font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
                    Maturity
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-left flex-1">
                  <h3 className="text-philo-amber-500/80 text-lg uppercase tracking-widest font-semibold mb-3">Your Philosophical Persona</h3>
                  <h2 className="serif text-5xl text-white mb-6 leading-tight drop-shadow-lg">
                    {result.philosophicalPersona}
                  </h2>
                  <p className="text-2xl text-slate-300 font-light leading-relaxed">
                    {result.generalAnalysis.length > 320
                      ? result.generalAnalysis.substring(0, 320) + "..."
                      : result.generalAnalysis}
                  </p>
                </div>
              </div>

              {/* Award if present */}
              {result.hasAward && (
                <div className="mt-10 flex items-center gap-4 bg-philo-amber-500/10 border border-philo-amber-500/30 px-8 py-4 rounded-full backdrop-blur-md">
                  <Award className="text-philo-amber-400" size={32} />
                  <span className="text-philo-amber-100 font-serif text-2xl">{result.awardTitle}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full flex justify-between items-center text-slate-500 text-sm uppercase tracking-widest border-t border-white/10 pt-6">
              <span>The Mirror of the Soul</span>
              <span>philomind.vercel.app</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};