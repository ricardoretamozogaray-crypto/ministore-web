import { twMerge } from 'tailwind-merge';

export function Input({ label, className, error, ...props }) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide dark:text-gray-400">
                    {label}
                </label>
            )}
            <input
                className={twMerge(
                    "w-full px-3 py-2 bg-white border border-border rounded-md text-sm text-text-main placeholder-text-muted transition-colors focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 dark:bg-surface-dark dark:border-border-dark dark:text-gray-100 dark:focus:border-primary",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
