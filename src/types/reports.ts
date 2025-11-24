// Types for Reports & Analytics

export interface BookingSummary {
  totalBookings: number;
  totalRevenue: number;
  rentals: number;
  taxis: number;
  transfers: number;
  hotels: number;
  sales: number;
}

export interface StatusBreakdown {
  [status: string]: number;
}

export interface RecentBooking {
  id: number;
  type: string;
  name: string;
  status: string;
  amount?: number;
  date: string;
}

export interface StaffPerformance {
  id: number;
  name: string;
  role: string;
  totalBookings: number;
  totalRevenue: number;
  bookings: number;
  revenue: number;
  completed: number;
  pending: number;
  cancelled: number;
  leads: number;
  feedback: number;
  reviews: number;
  usersManaged?: number;
  systemActions?: number;
  repeatCustomers?: number;
  vehiclesManaged?: number;
  maintenanceActions?: number;
}

export interface FinancialTransaction {
  id: number;
  description: string;
  date: string;
  category?: string;
  mtnMomoRWF?: number;
  equityBankRWF?: number;
  bkBankRWF?: number;
}

export interface AccountBalances {
  mtnMomoRWF: number;
  equityBankRWF: number;
  bkBankRWF: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  period: string;
  generatedBy: string;
  generatedAt: string;
  openingBalances: AccountBalances;
  closingBalances: AccountBalances;
  income: FinancialTransaction[];
  expenses: FinancialTransaction[];
}

export interface BookingStatsResponse {
  summary: BookingSummary;
  trendsLabels: string[];
  bookingsTrend: number[];
  revenueTrend: number[];
  statusBreakdown: StatusBreakdown;
  recentBookings: RecentBooking[];
}

export interface StaffPerformanceResponse {
  staffPerformance: StaffPerformance[];
  months: string[];
  staffTrends: { [key: string]: number[] };
}

export interface DateRange {
  from: string;
  to: string;
}

export type TabType = 'trends' | 'status' | 'service' | 'activity' | 'staff' | 'finance';
export type SortKey = 'revenue' | 'bookings' | 'name' | 'completed';
export type FinancialPeriod = 'all' | 'custom' | 'month' | 'quarter' | 'year';

