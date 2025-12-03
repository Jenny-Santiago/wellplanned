import { forwardRef } from 'react';

const Button = forwardRef(({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    className = '', 
    ...props 
}, ref) => {
    const baseClasses = 'font-semibold rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-yellow-400 hover:bg-yellow-300 text-black focus:ring-yellow-400 disabled:bg-gray-700',
        secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 focus:ring-gray-500 disabled:bg-gray-900',
        danger: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500 disabled:bg-gray-700',
        ghost: 'bg-transparent hover:bg-gray-800 text-gray-300 focus:ring-gray-500'
    };
    
    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };
    
    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
    
    return (
        <button
            ref={ref}
            className={classes}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };