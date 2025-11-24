'use client';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  className = "",
  disabled = false,
  autoFocus = false,
  required = false,
  id,
  name
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component is hydrated before showing toggle button
  useEffect(() => {
    setIsClient(true);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const defaultClassName = "border w-full p-3 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent";
  // Always add right padding for the toggle button to maintain consistent layout
  const finalClassName = className 
    ? `${className} pr-12` 
    : `${defaultClassName} pr-12`;

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={finalClassName}
        disabled={disabled}
        autoFocus={autoFocus}
        required={required}
        id={id}
        name={name}
      />
      {isClient && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5" />
          ) : (
            <FaEye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}
