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
                        'bg-gradient-to-r from-brand-gold to-brand-red text-white hover:from-brand-gold hover:to-brand-red focus:ring-brand-gold':
                            variant === 'primary',
                        'bg-brand-surface text-brand-black hover:bg-brand-olive-light focus:ring-brand-olive':
                            variant === 'secondary',
                        'border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/5 focus:ring-brand-gold':
                            variant === 'outline',
                        'text-brand-olive-dark hover:bg-brand-surface focus:ring-brand-olive':
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
