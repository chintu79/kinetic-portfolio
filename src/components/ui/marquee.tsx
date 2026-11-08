import { type ComponentPropsWithoutRef } from 'react';

// Magic UI Marquee — registry implementation verbatim, Tailwind wrappers ported
// to project CSS classes (this project has no Tailwind theme).
import { cn } from '../../lib/utils';

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn('work-marquee', vertical ? 'work-marquee-vertical' : undefined, className)}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0}
            className={cn(
              vertical ? 'work-marquee-group vertical' : 'work-marquee-group',
              pauseOnHover && 'pause-on-hover',
              reverse && 'reverse'
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
