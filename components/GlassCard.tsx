import React, { forwardRef } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({ children, className = "", hoverEffect = false }, ref) => {
  return (
    <div 
      ref={ref}
      className={`
        bg-white/40 
        backdrop-blur-xl 
        border border-white/40 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
        rounded-2xl 
        p-6 
        transition-all duration-500 ease-out
        ${hoverEffect ? 'hover:bg-white/50 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';