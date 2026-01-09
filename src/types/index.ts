// Main type definitions for KIMU Transport & Multiservices

export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'staff' | 'agent' | 'manager' | 'accountant';
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  profilePicture?: string;
  createdAt: Date;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

// Re-export payroll types
export * from './payroll';

// Re-export analytics types
export * from './analytics';

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
  power: string;
  fuelEfficiency: string;
  quantity: number;
  status: 'available' | 'rented' | 'maintenance' | 'sold';
  maintenanceNotes?: string;
  maintenanceDate?: Date;
  quantityUpdateReason?: string;
  quantityUpdateDate?: Date;
  licensePlate?: string;
  vehicleId?: string;
}

export interface Booking {
  id: number;
  type: string;
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
  status: 'Active' | 'Completed' | 'Cancelled' | 'Pending';
  createdAt: Date;
}

export interface Notification {
  id: number;
  userId?: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface Payment {
  id: number;
  bookingId: number;
  bookingType: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: Date;
  userId?: number;
}



export interface Lead {
  id: number;
  name: string;
  company: string;
  stage: 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed';
  value: number;
  contact?: string;
  email?: string;
  location?: string;
  lastContact: Date;
  nextFollowUp: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Activity {
  id: number;
  date: Date;
  client: string;
  activity: string;
  outcome: string;
  type: 'call' | 'meeting' | 'email' | 'visit';
  createdAt: Date;
}

// Financial types for accountant
export interface FinancialTransaction {
  id: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  reference?: string;
  status: 'pending' | 'completed' | 'cancelled';
  userId?: number;
  createdAt: Date;
}

export interface FinancialReport {
  id: number;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  currency: string;
  generatedBy: number;
  createdAt: Date;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  budget?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface IncomeCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface VehicleForm {
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
  power: string;
  fuelEfficiency: string;
  quantity: number;
  licensePlate?: string;
  vehicleId?: string;
}

export interface BookingForm {
  type: string;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  idOrPassport?: string;
  carType?: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  rentalDays?: number;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ModalState {
  isOpen: boolean;
  data?: any;
}

export interface FilterState {
  search: string;
  category?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  requiresAuth?: boolean;
  roles?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}
