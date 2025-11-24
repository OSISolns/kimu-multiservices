"use client";

import { useState, useEffect, useCallback } from 'react';
import { FaBell } from 'react-icons/fa';
import { useUser } from '@/app/UserContext';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function NotificationBell({
  className = '',
  size = 'md',
  showCount = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: NotificationBellProps) {
  const { user } = useUser();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Size configurations
  const sizeConfig = {
    sm: {
      bell: 'text-base',
      container: 'w-8 h-8',
      badge: 'text-xs px-1.5 py-0.5 min-w-5 h-5'
    },
    md: {
      bell: 'text-lg',
      container: 'w-10 h-10',
      badge: 'text-xs px-2 py-1 min-w-6 h-6'
    },
    lg: {
      bell: 'text-xl',
      container: 'w-12 h-12',
      badge: 'text-sm px-2.5 py-1 min-w-7 h-7'
    }
  };

  const config = sizeConfig[size];

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}&read=false`);

      if (response.ok) {
        const notifications = await response.json();
        const newCount = notifications.length;
        
        // Check if there are new notifications to trigger ring animation
        if (newCount > unreadCount && unreadCount > 0) {
          setIsRinging(true);
          setTimeout(() => setIsRinging(false), 1000);
        }
        
        setUnreadCount(newCount);
        setLastFetchTime(Date.now());
      }
    } catch (error) {
      console.warn('Failed to fetch notification count:', error);
    }
  }, [user?.id, unreadCount]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id, fetchUnreadCount]);

  useEffect(() => {
    if (!autoRefresh || !user?.id) return;

    const interval = setInterval(fetchUnreadCount, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchUnreadCount, user?.id]);

  // Handle click to navigate to notifications
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    router.push('/staff/notifications');
  }, [router]);

  // Force refresh method (can be called from parent components)
  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Expose refresh method to parent components
  useEffect(() => {
    // Store the refresh method on the component for external access
    (handleClick as any).refresh = refresh;
  }, [refresh, handleClick]);

  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 hover:scale-110 ${config.container} ${className}`}
      onClick={handleClick}
      title={`${unreadCount} unread notifications`}
    >
      {/* Bell Icon with Ring Animation */}
      <div className="relative flex items-center justify-center w-full h-full">
        <FaBell 
          className={`
            ${config.bell} 
            transition-all duration-300
            ${unreadCount > 0 ? 'text-orange-500' : 'text-gray-400'}
            ${isRinging ? 'animate-bell-ring' : ''}
            hover:text-orange-600
          `}
        />
        
        {/* Ring Animation Overlay */}
        {isRinging && (
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full border-2 border-orange-400 rounded-full opacity-75"></div>
          </div>
        )}
      </div>

      {/* Notification Count Badge */}
      {showCount && unreadCount > 0 && (
        <div 
          className={`
            absolute -top-1 -right-1 
            bg-red-500 text-white font-bold rounded-full 
            flex items-center justify-center
            animate-notification-pulse
            ${config.badge}
            shadow-lg border-2 border-white
          `}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}

      {/* Subtle glow effect for unread notifications */}
      {unreadCount > 0 && (
        <div className="absolute inset-0 rounded-full bg-orange-200 opacity-20 animate-pulse"></div>
      )}
    </div>
  );
}

// Export refresh function for external components
export const refreshNotificationBell = (bellRef?: any) => {
  if (bellRef?.refresh) {
    bellRef.refresh();
  }
};
