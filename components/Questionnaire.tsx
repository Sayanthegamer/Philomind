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
      <div className="mb-8 w-full h-1 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500/50 backdrop-blur-sm transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={`transition-all duration-500 transform ${isExiting ? 'opacity-0 -translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}`}>
        <GlassCard className="min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="px-3 py-1 bg-white/50 rounded-full text-xs font-bold tracking-widest text-indigo-900 uppercase">
                Question {currentIdx + 1} of {shuffledQuestions.length}
              </span>
            </div>

            <h2 className="serif text-3xl md:text-4xl text-slate-800 mb-6 leading-tight">
              {question.text}
            </h2>

            <textarea
              className="w-full bg-white/30 border border-white/50 rounded-xl p-4 text-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/50 focus:bg-white/60 transition-all resize-none min-h-[120px] mb-6"
              placeholder={question.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />

            {/* Common Answers Options */}
            {question.options && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">
                  <Sparkles size={12} />
                  <span>Common Reflections</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className="text-left px-4 py-3 rounded-lg bg-white/40 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-sm text-slate-600 border border-transparent hover:border-indigo-100"
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
                text-white font-medium transition-all duration-300
                ${currentAnswer.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed opacity-70'}
              `}
            >
              <span>{currentIdx === shuffledQuestions.length - 1 ? "Finish Reflection" : "Next Thought"}</span>
              {currentIdx === shuffledQuestions.length - 1 ? <CheckCircle size={18} /> : <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </GlassCard>
      </div>

      <p className="text-center mt-6 text-slate-500 text-sm font-light italic">
        "The unexamined life is not worth living." — Socrates
      </p>
    </div>
  );
};