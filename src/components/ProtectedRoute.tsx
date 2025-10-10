'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/UserContext';
import { hasRole, hasPermission } from '@/utils/auth';
import { UserRole, Permission } from '@/types/auth';
import LoadingSpinner from './LoadingSpinner';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions,
  fallback,
  redirectTo = '/staff/login'
}: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check role requirements
      if (requiredRole && user && !hasRole(user as any, requiredRole)) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Check permission requirements
      if (requiredPermissions && user) {
        const hasAllPermissions = requiredPermissions.every(permission =>
          hasPermission(user as any, permission.resource, permission.action)
        );
        
        if (!hasAllPermissions) {
          setIsAuthorized(false);
          setIsChecking(false);
          return;
        }
      }

      // User is authorized
      setIsAuthorized(true);
      setIsChecking(false);
    }
  }, [user, isLoading, requiredRole, requiredPermissions, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show fallback or default unauthorized message
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FaLock className="text-3xl text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
          </div>

          {requiredRole && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <FaExclamationTriangle className="text-sm" />
                <span className="font-semibold">Required Role:</span>
              </div>
              <p className="text-sm text-yellow-700">
                {requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} or higher
              </p>
            </div>
          )}

          {requiredPermissions && requiredPermissions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-left">
                <div className="font-semibold text-blue-800 mb-2">Required Permissions:</div>
                <ul className="text-sm text-blue-700 space-y-1">
                  {requiredPermissions.map((permission, index) => (
                    <li key={index}>
                      • {permission.action} on {permission.resource}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200"
            >
              Go Back
            </button>
            <button
              onClick={() => router.push('/staff/dashboard')}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Need access? Contact your administrator:
            </p>
            <div className="text-sm text-gray-600">
              <p>📧 valery.osisolns@gmail.com</p>
              <p>📞 +250 788 647 452</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authorized, render children
  return <>{children}</>;
}

/**
 * Higher-order component for role-based protection
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole
) {
  return function RoleProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Higher-order component for permission-based protection
 */
export function withPermissionProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[]
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredPermissions={requiredPermissions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking if user can access a specific resource
 */
export function useAccessControl() {
  const { user } = useUser();

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;
    return hasPermission(user as any, resource, action);
  };

  const hasRequiredRole = (role: UserRole): boolean => {
    if (!user) return false;
    return hasRole(user as any, role);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;
    
         // Define route-based access control
     const routePermissions: Record<string, UserRole[]> = {
       '/staff/users': ['admin', 'manager'],
       '/staff/vehicles': ['admin', 'manager', 'staff'],
       '/staff/bookings': ['admin', 'manager', 'staff', 'agent'],
       '/staff/reports': ['admin', 'manager', 'staff'],
       '/staff/financial-reports': ['admin', 'manager', 'accountant'],
       '/staff/accountant-dashboard': ['admin', 'accountant'],
       '/admin': ['admin']
     };
    
         for (const [routePattern, allowedRoles] of Object.entries(routePermissions)) {
       if (route.startsWith(routePattern)) {
         return allowedRoles.includes(user.role as UserRole);
       }
     }
    
    return true;
  };

  return {
    canAccess,
    hasRequiredRole,
    canAccessRoute,
    user
  };
}
