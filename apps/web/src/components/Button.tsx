import { ComponentPropsWithoutRef, ElementRef, ElementType, forwardRef, Ref } from 'react';
import type { ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
} & Omit<ComponentPropsWithoutRef<T>, 'color'>;

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sky-400';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand-sky-400 text-brand-slate hover:bg-brand-sky-300 disabled:bg-brand-sky-700 disabled:text-brand-slate/60',
  secondary:
    'bg-brand-slate/80 border border-brand-sky-600 text-brand-sky-100 hover:bg-brand-slate/60 disabled:border-brand-slate/60 disabled:text-brand-sky-300/60',
  ghost: 'text-brand-sky-200 hover:text-brand-sky-100 hover:bg-brand-slate/60 disabled:text-brand-sky-300/60'
};

const sizeStyles = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-5 py-2'
};

const ButtonInner = <T extends ElementType = 'button'>({
  className,
  as,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps<T>, ref: Ref<ElementRef<T>>) => {
  const Component = (as ?? 'button') as ElementType;
  return (
    <Component
      ref={ref}
      className={twMerge(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
};

export const Button = forwardRef(ButtonInner) as <T extends ElementType = 'button'>(
  props: ButtonProps<T> & { ref?: Ref<ElementRef<T>> }
) => ReactElement | null;

Button.displayName = 'Button';
