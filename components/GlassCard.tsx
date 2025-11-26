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
        liquid-glass
        rounded-2xl 
        p-6 
        transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275)
        ${hoverEffect ? 'hover:bg-white/15 hover:shadow-[0_8px_32px_0_rgba(217,119,6,0.15)] hover:-translate-y-1 hover:border-philo-amber-400/30' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';