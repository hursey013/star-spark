import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16'
};

export const Avatar = ({ src, alt, size = 'md' }: AvatarProps) => {
  if (!src) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={clsx(
          'inline-flex items-center justify-center rounded-full bg-slate-800 text-brand-sky-200',
          sizeMap[size]
        )}
      >
        ✨
      </span>
    );
  }

  return <img src={src} alt={alt} className={clsx('rounded-full object-cover', sizeMap[size])} />;
};
