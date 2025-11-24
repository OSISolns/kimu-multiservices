"use client";

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: FaCheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        textColor: 'text-green-800',
        iconColor: 'text-green-500',
    },
    error: {
        icon: FaExclamationCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-800',
        iconColor: 'text-red-500',
    },
    warning: {
        icon: FaExclamationTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500',
    },
    info: {
        icon: FaInfoCircle,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-500',
    },
};

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const config = toastConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div
            className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border-l-4 rounded-xl shadow-lg p-4 mb-3 min-w-[320px] max-w-md
        transition-all duration-300 ease-out backdrop-blur-sm
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
        >
            <div className="flex items-start gap-3">
                <Icon className={`${config.iconColor} text-xl flex-shrink-0 mt-0.5`} />
                <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
                <button
                    onClick={handleClose}
                    className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                    aria-label="Close notification"
                >
                    <FaTimes className="text-sm" />
                </button>
            </div>
        </div>
    );
}

export interface ToastContainerProps {
    toasts: Array<{
        id: string;
        type: ToastType;
        message: string;
        duration?: number;
    }>;
    onClose: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({ toasts, onClose, position = 'top-right' }: ToastContainerProps) {
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-[9999] pointer-events-none`}>
            <div className="pointer-events-auto flex flex-col">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        duration={toast.duration}
                        onClose={onClose}
                    />
                ))}
            </div>
        </div>
    );
}

// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<Array<{
        id: string;
        type: ToastType;
        message: string;
        duration?: number;
    }>>([]);

    const showToast = (type: ToastType, message: string, duration?: number) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, type, message, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return {
        toasts,
        showToast,
        removeToast,
        success: (message: string, duration?: number) => showToast('success', message, duration),
        error: (message: string, duration?: number) => showToast('error', message, duration),
        warning: (message: string, duration?: number) => showToast('warning', message, duration),
        info: (message: string, duration?: number) => showToast('info', message, duration),
    };
}
