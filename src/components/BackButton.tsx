'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'pill';
}

export default function BackButton({ 
  href, 
  label = 'Back', 
  className = '',
  variant = 'default'
}: BackButtonProps) {
  const router = useRouter();

  const variantClasses = {
    default: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-md transition-all duration-200 shadow-sm group',
    ghost: 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all duration-200 group',
    pill: 'inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-slate-700 to-slate-800 rounded-full hover:from-slate-800 hover:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 group',
  };

  const iconClass = 'text-slate-400 group-hover:text-slate-600 transition-colors group-hover:-translate-x-0.5 transition-transform duration-200';

  const content = (
    <>
      <FaArrowLeft className={iconClass} />
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${variantClasses[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      onClick={() => router.back()} 
      type="button"
      className={`${variantClasses[variant]} ${className}`}
    >
      {content}
    </button>
  );
}
