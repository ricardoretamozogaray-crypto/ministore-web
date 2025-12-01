import { twMerge } from 'tailwind-merge';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={twMerge(
                "bg-surface border border-border rounded-lg shadow-soft p-6 dark:bg-surface-dark dark:border-border-dark",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
