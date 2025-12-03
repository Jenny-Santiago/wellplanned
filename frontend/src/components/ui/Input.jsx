import { forwardRef } from 'react';

const Input = forwardRef(({ 
    type = 'text', 
    placeholder, 
    className = '', 
    error = false,
    ...props 
}, ref) => {
    const baseClasses = 'w-full px-4 py-2 bg-gray-900 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition';
    const errorClasses = error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-700 focus:border-yellow-400 focus:ring-yellow-400';
    
    const classes = `${baseClasses} ${errorClasses} ${className}`;
    
    return (
        <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={classes}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };