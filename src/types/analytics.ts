// Analytics and Reporting Types

export interface ReportTemplate {
  id: number;
  name: string;
  description?: string;
  category: 'financial' | 'operational' | 'customer' | 'employee';
  query: any; // JSON configuration
  parameters?: any; // JSON schema
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    fullName?: string;
  };
}

export interface Report {
  id: number;
  templateId?: number;
  name: string;
  description?: string;
  category: string;
  type: 'scheduled' | 'on_demand' | 'real_time';
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: any;
  filters?: any;
  data?: any;
  filePath?: string;
  fileFormat?: 'pdf' | 'excel' | 'csv' | 'json';
  generatedBy: number;
  generatedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  template?: ReportTemplate;
  user: {
    id: number;
    username: string;
    fullName?: string;
  };
}

export interface Dashboard {
  id: number;
  name: string;
  description?: string;
  layout: any; // JSON configuration
  widgets: any; // JSON configuration
  isPublic: boolean;
  isDefault: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    fullName?: string;
  };
}

export interface AnalyticsEvent {
  id: number;
  eventType: 'page_view' | 'user_action' | 'system_event' | 'business_event';
  eventName: string;
  properties?: any;
  userId?: number;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  user?: {
    id: number;
    username: string;
    fullName?: string;
  };
}

export interface FinancialReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
}

export interface OperationalReport {
  period: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  bookingsByType: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  vehicleUtilization: Array<{
    vehicleId: string;
    vehicleName: string;
    utilizationRate: number;
    revenue: number;
  }>;
  staffPerformance: Array<{
    staffId: number;
    staffName: string;
    bookingsHandled: number;
    revenue: number;
    rating: number;
  }>;
}

export interface CustomerReport {
  period: string;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageCustomerValue: number;
  customersBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    averageValue: number;
  }>;
  topCustomers: Array<{
    customerId: number;
    customerName: string;
    totalValue: number;
    bookings: number;
  }>;
}

export interface EmployeeReport {
  period: string;
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  departures: number;
  averageSalary: number;
  totalPayroll: number;
  employeesByDepartment: Array<{
    department: string;
    count: number;
    averageSalary: number;
    totalPayroll: number;
  }>;
  performanceMetrics: Array<{
    employeeId: number;
    employeeName: string;
    department: string;
    performanceScore: number;
    salary: number;
  }>;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'kpi';
  title: string;
  data: any;
  config: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CreateReportData {
  templateId?: number;
  name: string;
  description?: string;
  category: string;
  type: 'scheduled' | 'on_demand' | 'real_time';
  parameters?: any;
  filters?: any;
}

export interface CreateDashboardData {
  name: string;
  description?: string;
  layout: any;
  widgets: any;
  isPublic?: boolean;
  isDefault?: boolean;
}

export interface ReportFilters {
  category?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedBy?: number;
}

export interface AnalyticsFilters {
  eventType?: string;
  eventName?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportStats {
  totalReports: number;
  completedReports: number;
  pendingReports: number;
  failedReports: number;
  totalTemplates: number;
  activeTemplates: number;
  totalDashboards: number;
  publicDashboards: number;
}
