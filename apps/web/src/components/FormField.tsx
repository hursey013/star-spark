import { clsx } from 'clsx';
import { PropsWithChildren } from 'react';

interface FormFieldProps extends PropsWithChildren {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
}

export const FormField = ({ label, htmlFor, hint, required, children }: FormFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-brand-sky-200">
      {label}
      {required ? <span className="ml-1 text-brand-sky-300">*</span> : null}
    </label>
    {children}
    {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
  </div>
);

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const TextInput = ({ className, invalid, ...props }: TextInputProps) => (
  <input
    className={clsx(
      'w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-brand-sky-50 placeholder:text-slate-500 focus:border-brand-sky-400 focus:outline-none focus:ring-2 focus:ring-brand-sky-500/60',
      invalid && 'border-red-400 focus:ring-red-400/40',
      className
    )}
    {...props}
  />
);

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const SelectInput = ({ className, ...props }: SelectInputProps) => (
  <select
    className={clsx(
      'w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-brand-sky-50 focus:border-brand-sky-400 focus:outline-none focus:ring-2 focus:ring-brand-sky-500/60',
      className
    )}
    {...props}
  />
);
