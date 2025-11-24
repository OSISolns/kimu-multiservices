// Authentication types for KIMU Transport & Multiservices

export interface AuthUser {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  profilePicture?: string;
  totpSecret?: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  lastLogin?: Date;
}

export type UserRole = 'admin' | 'staff' | 'agent' | 'manager' | 'accountant' | 'sales' | 'transport-officer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  requiresMFA?: boolean;
  message?: string;
  error?: string;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerification {
  code: string;
  rememberDevice?: boolean;
  deviceId?: string;
  deviceName?: string;
}

export interface MFAVerificationResponse {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordReset {
  email: string;
  resetToken?: string;
  newPassword?: string;
}

export interface TrustedDevice {
  id: number;
  userId: number;
  deviceId: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  lastUsed: Date;
}

export interface DeviceFingerprint {
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

export interface Session {
  id: string;
  userId: number;
  token: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshUser: () => Promise<void>;
}

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
}

export interface AuthHookReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}
