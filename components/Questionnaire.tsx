import React, { useState, useEffect, useMemo } from 'react';
import { QUESTIONS } from '../constants';
import { GlassCard } from './GlassCard';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Question } from '../types';

interface QuestionnaireProps {
  onComplete: (answers: Record<number, string>) => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  // Randomize questions once on mount
  const shuffledQuestions = useMemo(() => {
    return [...QUESTIONS].sort(() => Math.random() - 0.5);
  }, []);

  const question = shuffledQuestions[currentIdx];
  const progress = ((currentIdx) / shuffledQuestions.length) * 100;

  useEffect(() => {
    // Reset local input when question changes
    if (question) {
      setCurrentAnswer(answers[question.id] || "");
    }
  }, [currentIdx, question, answers]);

  const handleNext = () => {
    if (!currentAnswer.trim()) return;

    // Save answer
    const newAnswers = { ...answers, [question.id]: currentAnswer };
    setAnswers(newAnswers);

    // Animation transition
    setIsExiting(true);
    setTimeout(() => {
      if (currentIdx < shuffledQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setIsExiting(false);
      } else {
        // Finished
        onComplete(newAnswers);
      }
    }, 400); // Wait for exit animation
  };

  const handleOptionClick = (option: string) => {
    setCurrentAnswer(option);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  if (!question) return null;

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10 px-4 animate-fadeInUp">
      {/* Progress Bar */}
      <div className="mb-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-philo-amber-500/80 backdrop-blur-sm transition-all duration-700 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`transition-all duration-500 transform ${isExiting ? 'opacity-0 -translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}>
        <GlassCard className="min-h-[400px] flex flex-col justify-between gel-border">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="px-3 py-1 bg-philo-navy-900/30 border border-white/10 rounded-full text-xs font-bold tracking-widest text-philo-amber-400 uppercase">
                Question {currentIdx + 1} of {shuffledQuestions.length}
              </span>
            </div>

            <h2 className="serif text-3xl md:text-4xl text-white mb-6 leading-tight drop-shadow-md">
              {question.text}
            </h2>

            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-philo-amber-500/50 focus:bg-white/10 transition-all resize-none min-h-[120px] mb-6 backdrop-blur-sm"
              placeholder={question.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* Common Answers Options */}
            {question.options && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-philo-amber-400/80 text-xs uppercase tracking-widest font-semibold mb-2">
                  <Sparkles size={12} />
                  <span>Common Reflections</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className="text-left px-4 py-3 rounded-lg bg-white/5 hover:bg-philo-amber-500/10 hover:text-philo-amber-300 transition-all duration-300 text-sm text-slate-300 border border-white/5 hover:border-philo-amber-500/30 bounce-on-hover"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
              className={`
                group flex items-center gap-2 px-8 py-3 rounded-full 
                font-medium transition-all duration-300
                ${currentAnswer.trim()
                  ? 'bg-philo-amber-500 hover:bg-philo-amber-400 text-philo-navy-900 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer hover:-translate-y-1 active:scale-95'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed opacity-70'}
              `}
            >
              <span>{currentIdx === shuffledQuestions.length - 1 ? "Finish Reflection" : "Next Thought"}</span>
              {currentIdx === shuffledQuestions.length - 1 ? <CheckCircle size={18} /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </GlassCard>
      </div>

      <p className="text-center mt-6 text-slate-400 text-sm font-light italic opacity-60">
        "The unexamined life is not worth living." — Socrates
      </p>
    </div>
  );
};