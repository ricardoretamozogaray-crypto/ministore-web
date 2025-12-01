import { twMerge } from 'tailwind-merge';

export function Button({ children, variant = 'primary', className, ...props }) {
    const baseStyles = "px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-soft",
        secondary: "bg-white text-text-main border border-border hover:bg-gray-50 focus:ring-gray-200 dark:bg-surface-dark dark:border-border-dark dark:text-gray-200 dark:hover:bg-gray-800",
        ghost: "bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-main dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent focus:ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}
