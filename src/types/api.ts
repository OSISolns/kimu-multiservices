// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  details?: any;
}

// User Types
export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  profilePicture?: string;
  createdAt: Date;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'accountant' | 'transport-officer' | 'agent';
export type UserStatus = 'active' | 'inactive' | 'suspended';

// Vehicle Types
export interface Vehicle {
  id: number;
  name: string;
  image: string;
  type: string;
  category: string;
  price: string;
  year: number;
  engine: string;
  mileage: string;
  transmission: string;
  fuel: string;
  capacity: string;
  doors: number;
  description: string;
  isAvailable: boolean;
  power?: string;
  fuelEfficiency?: string;
  quantity: number;
  status: VehicleStatus;
  maintenanceNotes?: string;
  maintenanceDate?: Date;
  quantityUpdateReason?: string;
  quantityUpdateDate?: Date;
  licensePlate?: string;
  vehicleId?: string;
}

export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'out_of_service';

// Booking Types
export interface Booking {
  id: number;
  type: BookingType;
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  idOrPassport?: string;
  carType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  rentalDays?: number;
  returnConfirmed: boolean;
  fullTank: boolean;
  status: BookingStatus;
  createdAt: Date;
}

export type BookingType = 'Car Rental' | 'Hotel' | 'Taxi Service' | 'Airport Transfer' | 'City Tour';
export type BookingStatus = 'Active' | 'Completed' | 'Cancelled' | 'Pending';

// Lead Types
export interface Lead {
  id: number;
  name: string;
  company: string;
  stage: LeadStage;
  value: number;
  contact?: string;
  email?: string;
  location?: string;
  lastContact: Date;
  nextFollowUp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStage = 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

// Notification Types
export interface Notification {
  id: number;
  userId?: number;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'system';

// Activity Log Types
export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Payment Types
export interface Payment {
  id: number;
  bookingId: number;
  bookingType: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: Date;
  userId?: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Trusted Device Types
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

// Campaign Types
export interface Campaign {
  id: number;
  name: string;
  reach: number;
  engagement: number;
  leads: number;
  conversions: number;
  budget: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Types
export interface Activity {
  id: number;
  date: Date;
  client: string;
  activity: string;
  outcome: string;
  type: ActivityType;
  createdAt: Date;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up';

// System Log Types
export interface SystemLog {
  id: number;
  action: string;
  details?: string;
  createdBy?: number;
  createdAt: Date;
}

// Request/Response Types for API endpoints
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: UserRole;
    requiresTotp: boolean;
    fullName?: string;
    email?: string;
  };
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface UpdateUserRequest {
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  department?: string;
  status?: UserStatus;
}

export interface CreateVehicleRequest {
  name: string;
  type: string;
  category: string;
  price: string;
  year: number;
  engine: string;
  mileage: string;
  transmission: string;
  fuel: string;
  capacity: string;
  doors: number;
  description: string;
  power?: string;
  fuelEfficiency?: string;
  quantity?: number;
  licensePlate?: string;
  customPlateNumber?: string;
}

export interface CreateBookingRequest {
  type: BookingType;
  name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  idOrPassport?: string;
  carType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  rentalDays?: number;
  fullTank?: boolean;
}

export interface CreateLeadRequest {
  name: string;
  company: string;
  stage?: LeadStage;
  value?: number;
  contact?: string;
  email?: string;
  location?: string;
  nextFollowUp?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter Types
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  search?: string;
}

export interface VehicleFilters {
  type?: string;
  category?: string;
  status?: VehicleStatus;
  isAvailable?: boolean;
  search?: string;
}

export interface BookingFilters {
  type?: BookingType;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  recentBookings: Booking[];
  topVehicles: Array<{
    vehicle: Vehicle;
    bookingCount: number;
  }>;
}

// Report Types
export interface ReportParams {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
  filters?: Record<string, any>;
}

export interface RevenueReport {
  period: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
}

export interface VehicleUtilizationReport {
  vehicle: Vehicle;
  utilizationRate: number;
  totalBookings: number;
  totalRevenue: number;
  averageBookingDuration: number;
}
