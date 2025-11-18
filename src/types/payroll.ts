// Payroll Management Types

export interface Employee {
  id: number;
  userId: number;
  employeeId: string;
  position: string;
  department: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  hireDate: Date;
  salary: number;
  hourlyRate?: number;
  workingHours?: number;
  bankAccount?: string;
  bankName?: string;
  taxId?: string;
  socialSecurityId?: string;
  status: 'active' | 'inactive' | 'terminated';
  terminationDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role: string;
  };
}

export interface SalaryStructure {
  id: number;
  employeeId: number;
  baseSalary: number;
  allowances: Allowances;
  deductions: Deductions;
  effectiveDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Allowances {
  transport?: number;
  housing?: number;
  medical?: number;
  meal?: number;
  communication?: number;
  fuel?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface Deductions {
  tax?: number;
  socialSecurity?: number;
  loan?: number;
  advance?: number;
  insurance?: number;
  other?: number;
  [key: string]: number | undefined;
}

export interface Payroll {
  id: number;
  employeeId: number;
  period: string; // YYYY-MM format
  year: number;
  month: number;
  status: 'draft' | 'processed' | 'paid' | 'cancelled';
  grossSalary: number;
  netSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  workingDays: number;
  actualDays?: number;
  overtimeHours: number;
  overtimePay: number;
  bonus: number;
  advance: number;
  loanDeduction: number;
  taxDeduction: number;
  socialSecurity: number;
  otherDeductions: number;
  paymentMethod?: 'bank_transfer' | 'cash' | 'mobile_money';
  paymentDate?: Date;
  processedBy?: number;
  processedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  employee: Employee;
  payrollItems: PayrollItem[];
}

export interface PayrollItem {
  id: number;
  payrollId: number;
  employeeId: number;
  type: 'allowance' | 'deduction' | 'bonus' | 'overtime' | 'salary';
  name: string;
  amount: number;
  percentage?: number;
  description?: string;
  createdAt: Date;
}

export interface PayrollSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  averageSalary: number;
  period: string;
}

export interface PayrollReport {
  period: string;
  year: number;
  month: number;
  summary: PayrollSummary;
  employees: Payroll[];
  totalPayroll: number;
  status: 'draft' | 'processed' | 'paid';
}

export interface CreateEmployeeData {
  userId: number;
  employeeId: string;
  position: string;
  department: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  hireDate: Date;
  salary: number;
  hourlyRate?: number;
  workingHours?: number;
  bankAccount?: string;
  bankName?: string;
  taxId?: string;
  socialSecurityId?: string;
  notes?: string;
}

export interface UpdateEmployeeData {
  position?: string;
  department?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern';
  salary?: number;
  hourlyRate?: number;
  workingHours?: number;
  bankAccount?: string;
  bankName?: string;
  taxId?: string;
  socialSecurityId?: string;
  status?: 'active' | 'inactive' | 'terminated';
  terminationDate?: Date;
  notes?: string;
}

export interface CreatePayrollData {
  employeeId: number;
  period: string;
  year: number;
  month: number;
  grossSalary: number;
  netSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  workingDays: number;
  actualDays?: number;
  overtimeHours?: number;
  overtimePay?: number;
  bonus?: number;
  advance?: number;
  loanDeduction?: number;
  taxDeduction?: number;
  socialSecurity?: number;
  otherDeductions?: number;
  notes?: string;
  payrollItems: Omit<PayrollItem, 'id' | 'payrollId' | 'employeeId' | 'createdAt'>[];
}

export interface ProcessPayrollData {
  employeeIds: number[];
  period: string;
  year: number;
  month: number;
  workingDays: number;
  notes?: string;
}

export interface PayrollFilters {
  period?: string;
  year?: number;
  month?: number;
  status?: 'draft' | 'processed' | 'paid' | 'cancelled';
  department?: string;
  employeeId?: number;
}

export interface PayrollStats {
  totalPayroll: number;
  averageSalary: number;
  totalEmployees: number;
  activeEmployees: number;
  processedPayrolls: number;
  pendingPayrolls: number;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    employees: number;
  }>;
  departmentBreakdown: Array<{
    department: string;
    count: number;
    totalSalary: number;
  }>;
}

