'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  inline?: boolean;
  variant?: 'logo' | 'spinner' | 'dots' | 'pulse' | 'company';
  color?: 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'auto';
  showProgress?: boolean;
  duration?: number; // in seconds for progress animation
}

const LoadingSpinner = function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md', 
  fullScreen = false,
  inline = false,
  variant = 'company',
  color = 'auto',
  showProgress = false,
  duration = 3
}: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(0);

  // Memoized size configurations
  const sizeConfigs = useMemo(() => ({
    xs: {
      spinner: 'w-3 h-3',
      logo: 'w-8 h-8',
      text: 'text-xs',
      dots: 'w-1 h-1',
      border: 'border-2'
    },
    sm: {
      spinner: 'w-4 h-4',
      logo: 'w-12 h-12',
      text: 'text-sm',
      dots: 'w-1.5 h-1.5',
      border: 'border-2'
    },
    md: {
      spinner: 'w-6 h-6',
      logo: 'w-16 h-16',
      text: 'text-base',
      dots: 'w-2 h-2',
      border: 'border-2'
    },
    lg: {
      spinner: 'w-8 h-8',
      logo: 'w-20 h-20',
      text: 'text-lg',
      dots: 'w-2.5 h-2.5',
      border: 'border-4'
    },
    xl: {
      spinner: 'w-12 h-12',
      logo: 'w-24 h-24',
      text: 'text-xl',
      dots: 'w-3 h-3',
      border: 'border-4'
    }
  }), []);

  // Memoized color schemes
  const colorSchemes = useMemo(() => ({
    blue: {
      primary: 'border-blue-600',
      secondary: 'border-blue-200',
      background: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600',
      text: 'text-blue-700'
    },
    orange: {
      primary: 'border-orange-600',
      secondary: 'border-orange-200',
      background: 'bg-orange-500',
      gradient: 'from-orange-400 to-orange-600',
      text: 'text-orange-700'
    },
    green: {
      primary: 'border-green-600',
      secondary: 'border-green-200',
      background: 'bg-green-500',
      gradient: 'from-green-400 to-green-600',
      text: 'text-green-700'
    },
    red: {
      primary: 'border-red-600',
      secondary: 'border-red-200',
      background: 'bg-red-500',
      gradient: 'from-red-400 to-red-600',
      text: 'text-red-700'
    },
    purple: {
      primary: 'border-purple-600',
      secondary: 'border-purple-200',
      background: 'bg-purple-500',
      gradient: 'from-purple-400 to-purple-600',
      text: 'text-purple-700'
    },
    auto: {
      primary: 'border-blue-600',
      secondary: 'border-blue-200',
      background: 'bg-gradient-to-r from-blue-500 to-orange-500',
      gradient: 'from-blue-400 via-purple-500 to-orange-500',
      text: 'text-slate-700'
    }
  }), []);

  const config = useMemo(() => sizeConfigs[size], [sizeConfigs, size]);
  // Memoize colors based on variant and color prop - using colorSchemes to avoid dynamic class issues
  const colors = useMemo(() => {
    const scheme = colorSchemes[color === 'auto' ? 'auto' : color] || colorSchemes.auto;
    return {
      primary: scheme.primary,
      secondary: scheme.secondary,
      background: scheme.background,
      gradient: scheme.gradient,
      text: scheme.text,
    };
  }, [color, colorSchemes]);

  // Progress animation effect
  useEffect(() => {
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 0;
          return prev + (100 / (duration * 10));
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showProgress, duration]);

  // Memoized render function for different variants
  const renderSpinner = useMemo(() => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`${config.spinner} ${config.border} ${colors.primary} border-t-transparent rounded-full animate-spin`} />
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className={`${config.dots} ${colors.background} rounded-full animate-bounce`} />
            <div className={`${config.dots} ${colors.background} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}} />
            <div className={`${config.dots} ${colors.background} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}} />
          </div>
        );

      case 'pulse':
        return (
          <div className={`${config.logo} bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse`} />
        );

      case 'logo':
        return (
          <div className="relative">
            <div className={`${config.logo} ${config.border} ${colors.primary} border-t-transparent rounded-full animate-spin absolute inset-0`} />
            <Image 
              src="/logo.png" 
              alt="KIMU Transport Logo" 
              width={64}
              height={64}
              className={`${config.logo} relative z-10 animate-pulse`}
            />
          </div>
        );

      case 'company':
      default:
        return (
          <div className="relative">
            {/* Outer rotating ring with gradient */}
            <div className={`${config.logo} ${config.border} border-transparent border-t-blue-500 border-r-orange-500 border-b-purple-400 border-l-green-400 rounded-full animate-ring-rotate absolute inset-0`} 
                 style={{ animationDuration: '6s' }} />
            
            {/* Middle pulsing ring */}
            <div className={`${config.logo} ${config.border} ${colors.secondary} rounded-full animate-glow-pulse absolute inset-0`} />
            
            {/* Inner floating ring */}
            <div className={`${config.logo} bg-gradient-to-r ${colors.gradient} rounded-full opacity-30 animate-pulse absolute inset-0`} 
                 style={{ animationDuration: '1.5s' }} />
            
            {/* Company logo */}
            <div className={`${config.logo} relative z-20 flex items-center justify-center`}>
              <Image 
                src="/logo.png" 
                alt="KIMU Transport Logo" 
                width={64}
                height={64}
                className={`${config.logo} object-contain animate-logo-float drop-shadow-lg`}
                style={{ animationDuration: '8s' }}
              />
            </div>
            
            {/* Outer glowing aura */}
            <div className={`${config.logo} bg-gradient-to-r ${colors.gradient} animate-gradient rounded-full opacity-20 animate-ping absolute inset-0`}
                 style={{ animationDuration: '5s' }} />
          </div>
        );
    }
  }, [variant, config, colors]);

  // Progress bar component
  const renderProgressBar = () => {
    if (!showProgress) return null;
    
    return (
      <div className="w-full max-w-xs mx-auto mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`text-center mt-2 ${config.text} ${colors.text} font-medium`}>
          {Math.round(progress)}%
        </div>
      </div>
    );
  };

  // Inline variant for buttons and small spaces
  if (inline) {
    return (
      <div className="inline-flex items-center gap-2">
        {renderSpinner}
        {message && <span className={`${config.text} ${colors.text}`}>{message}</span>}
      </div>
    );
  }

  // Container classes
  const containerClasses = fullScreen 
    ? "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center"
    : "text-center py-8";

  return (
    <div className={containerClasses}>
      <div className="text-center max-w-sm mx-auto">
        {/* Main spinner */}
        <div className="mb-6">
          {renderSpinner}
        </div>
        
        {/* Message */}
        {message && (
          <div className="space-y-2 mb-4">
            <h2 className={`${config.text} font-semibold ${colors.text}`}>
              {message}
            </h2>
            
            {/* Enhanced loading dots animation */}
            <div className="flex justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-wave-loading" />
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-wave-loading" style={{animationDelay: '0.2s'}} />
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-wave-loading" style={{animationDelay: '0.4s'}} />
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-wave-loading" style={{animationDelay: '0.6s'}} />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-wave-loading" style={{animationDelay: '0.8s'}} />
            </div>
          </div>
        )}
        
        {/* Progress bar */}
        {renderProgressBar()}
      </div>
    </div>
  );
}

export default LoadingSpinner;

// Memoized export variants for easy usage
export const LogoSpinner = function LogoSpinner(props: Omit<LoadingSpinnerProps, 'variant'>) {
  return <LoadingSpinner {...props} variant="logo" />;
};

export const DotsSpinner = function DotsSpinner(props: Omit<LoadingSpinnerProps, 'variant'>) {
  return <LoadingSpinner {...props} variant="dots" />;
};

export const CompanySpinner = function CompanySpinner(props: Omit<LoadingSpinnerProps, 'variant'>) {
  return <LoadingSpinner {...props} variant="company" />;
};

export const InlineSpinner = function InlineSpinner(props: Omit<LoadingSpinnerProps, 'inline'>) {
  return <LoadingSpinner {...props} inline={true} />;
};