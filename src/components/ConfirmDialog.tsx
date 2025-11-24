"use client";

import { useEffect, useRef } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const variantConfig = {
    danger: {
        buttonBg: 'bg-red-600 hover:bg-red-700',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100',
    },
    warning: {
        buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
    },
    info: {
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100',
    },
};

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const config = variantConfig[variant];

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);

        // Focus trap
        const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);

        // Auto-focus first button
        setTimeout(() => firstElement?.focus(), 100);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleTab);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                ref={dialogRef}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full transform animate-scale-in border border-white/50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className={`${config.iconBg} p-3 rounded-xl`}>
                            <FaExclamationTriangle className={`${config.iconColor} text-xl`} />
                        </div>
                        <h3 id="dialog-title" className="text-xl font-bold text-gray-900">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Close dialog"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p id="dialog-description" className="text-gray-600 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`px-6 py-2.5 ${config.buttonBg} text-white font-medium rounded-xl transition-all shadow-lg active:scale-95`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
