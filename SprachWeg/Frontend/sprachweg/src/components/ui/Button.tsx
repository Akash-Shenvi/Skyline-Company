import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    {
                        'bg-brand-red text-white hover:bg-brand-red-hover focus:ring-brand-gold':
                            variant === 'primary',
                        'bg-brand-black text-white hover:bg-brand-olive-dark focus:ring-brand-gold':
                            variant === 'secondary',
                        'border-2 border-brand-olive text-brand-olive hover:bg-brand-surface focus:ring-brand-gold':
                            variant === 'outline',
                        'text-brand-olive-dark hover:bg-brand-surface focus:ring-brand-gold':
                            variant === 'ghost',
                    },
                    {
                        'px-3 py-1.5 text-sm': size === 'sm',
                        'px-4 py-2 text-base': size === 'md',
                        'px-6 py-3 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
