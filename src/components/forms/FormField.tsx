'use client';

import React, { forwardRef } from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  title?: string;
  autoComplete?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  helpText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  step,
  pattern,
  title,
  autoComplete,
  className = '',
  labelClassName = '',
  inputClassName = '',
  helpText,
  icon,
  rightIcon
}, ref) => {
  const fieldId = `field-${name}`;
  const hasError = !!error;
  const hasSuccess = !!success;
  const isDisabled = disabled || readOnly;

  const getInputClasses = () => {
    const baseClasses = [
      'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
      'disabled:bg-gray-50 disabled:cursor-not-allowed',
      'read-only:bg-gray-50 read-only:cursor-default'
    ];

    if (hasError) {
      baseClasses.push('border-red-300 focus:border-red-500 focus:ring-red-500');
    } else if (hasSuccess) {
      baseClasses.push('border-green-300 focus:border-green-500 focus:ring-green-500');
    } else {
      baseClasses.push('border-gray-200 focus:border-blue-500');
    }

    if (icon) {
      baseClasses.push('pl-12');
    }
    if (rightIcon) {
      baseClasses.push('pr-12');
    }

    return [...baseClasses, inputClassName].join(' ');
  };

  const getLabelClasses = () => {
    const baseClasses = [
      'block text-sm font-medium mb-2',
      hasError ? 'text-red-600' : hasSuccess ? 'text-green-600' : 'text-gray-700'
    ];
    return [...baseClasses, labelClassName].join(' ');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor={fieldId} className={getLabelClasses()}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={isDisabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          title={title}
          autoComplete={autoComplete}
          className={getInputClasses()}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}

        {/* Status Icons */}
        {hasError && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
            <FaExclamationTriangle className="text-lg" />
          </div>
        )}
        {hasSuccess && !hasError && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
            <FaCheckCircle className="text-lg" />
          </div>
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}

      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <FaExclamationTriangle className="text-xs" />
          {error}
        </p>
      )}

      {/* Success Message */}
      {hasSuccess && !hasError && (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <FaCheckCircle className="text-xs" />
          {success}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
