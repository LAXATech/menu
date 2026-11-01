import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'brass';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/40';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-olive hover:bg-olive-hover active:scale-[0.98] text-cream border border-transparent shadow-subtle font-medium',
      secondary:
        'bg-cream hover:bg-ivory/60 active:scale-[0.98] text-espresso border border-taupe shadow-subtle font-medium',
      outline:
        'bg-transparent hover:bg-cream active:scale-[0.98] text-espresso border border-taupe font-medium',
      ghost:
        'bg-transparent hover:bg-taupe/30 active:scale-[0.98] text-warm-grey hover:text-espresso font-medium',
      brass:
        'bg-brass/10 hover:bg-brass/20 active:scale-[0.98] text-brass-dark border border-brass/25 font-medium',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 rounded-control text-xs gap-1.5',
      md: 'h-10 px-4 rounded-button text-xs font-semibold gap-2',
      lg: 'h-12 px-5 rounded-xl text-sm font-semibold gap-2.5',
      'icon-sm': 'w-8 h-8 rounded-control p-0',
      'icon-md': 'w-10 h-10 rounded-button p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

