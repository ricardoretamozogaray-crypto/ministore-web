import { X } from 'lucide-react';
import { useEffect } from 'react';

import { createPortal } from 'react-dom';

export function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border animate-in fade-in zoom-in-95 duration-200 dark:bg-surface-dark dark:border-border-dark" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-border-dark">
                    <h3 className="text-lg font-semibold text-text-main dark:text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-main transition-colors dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
