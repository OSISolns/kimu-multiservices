"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FaCamera, FaTrash, FaSpinner } from 'react-icons/fa';

interface ProfilePictureUploadProps {
  userId: number;
  currentProfilePicture?: string | null;
  adminUsername: string;
  onUploadSuccess?: (profilePicture: string) => void;
  onRemoveSuccess?: () => void;
  className?: string;
}

export default function ProfilePictureUpload({
  userId,
  currentProfilePicture,
  adminUsername,
  onUploadSuccess,
  onRemoveSuccess,
  className = ""
}: ProfilePictureUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('userId', userId.toString());
      formData.append('adminUsername', adminUsername);

      const response = await fetch('/api/users/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile picture uploaded successfully!');
        onUploadSuccess?.(data.profilePicture);
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this profile picture?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `/api/users/profile-picture?userId=${userId}&adminUsername=${adminUsername}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile picture removed successfully!');
        onRemoveSuccess?.();
      } else {
        setError(data.error || 'Removal failed');
      }
    } catch (error) {
      console.error('Remove error:', error);
      setError('Removal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`profile-picture-upload ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Profile Picture Display */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
            {currentProfilePicture ? (
              <Image
                src={currentProfilePicture}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={() => setError('Failed to load profile picture')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <FaCamera size={24} />
              </div>
            )}
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <FaSpinner className="animate-spin text-white" size={20} />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaCamera size={14} />
              <span className="text-sm">
                {currentProfilePicture ? 'Change Picture' : 'Upload Picture'}
              </span>
            </button>

            {currentProfilePicture && (
              <button
                onClick={handleRemove}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaTrash size={12} />
                <span className="text-sm">Remove</span>
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Supported: JPEG, PNG, GIF, WebP • Max size: 5MB
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-3 p-2 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
