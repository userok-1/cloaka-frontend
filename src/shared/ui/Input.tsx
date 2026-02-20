import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, rightElement, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-zinc-200">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
              error ? 'border-red-500' : 'border-zinc-700'
            } ${rightElement ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
