'use client';

// Verbatim from magicui.design registry — styling adapted to the KRISHNA® system in styles.css (.ihh-* classes).
import { ArrowRight } from 'lucide-react';

import { cn } from '../../lib/utils';

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('ihh-button', className)}
      {...props}
    >
      <div className="ihh-row">
        <div className="ihh-dot"></div>
        <span className="ihh-label">
          {children}
        </span>
      </div>
      <div className="ihh-hover">
        <span>{children}</span>
        <ArrowRight size={16} strokeWidth={2} />
      </div>
    </button>
  );
}
