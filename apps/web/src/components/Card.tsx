import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const Card = ({ as: Component = 'div', className, children }: CardProps) => (
  <Component
    className={clsx(
      'rounded-3xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-glow backdrop-blur transition hover:border-brand-sky-400/60',
      className
    )}
  >
    {children}
  </Component>
);
