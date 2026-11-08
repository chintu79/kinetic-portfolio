import { type ComponentPropsWithoutRef, type ReactNode } from 'react';

// Magic UI Bento Grid — registry implementation verbatim, except BentoCard is
// dropped (we use our own project cards) and the grid uses project CSS classes.
import { cn } from '../../lib/utils';

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div className={cn('work-bento', className)} {...props}>
      {children}
    </div>
  );
};
