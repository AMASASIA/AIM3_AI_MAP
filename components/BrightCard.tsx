import React from 'react';

interface BrightCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BrightCard: React.FC<BrightCardProps> = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white border border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] p-6 mb-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-display font-semibold mb-6 border-b border-ink/20 pb-2 tracking-wide text-ink">
          {title}
        </h2>
      )}
      <div className="font-serif text-lg leading-relaxed text-ink/90">
        {children}
      </div>
    </div>
  );
};