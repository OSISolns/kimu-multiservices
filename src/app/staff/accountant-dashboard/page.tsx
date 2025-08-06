"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaMoneyBillWave, FaChartLine, FaCreditCard, FaReceipt, FaCalculator, FaFileInvoiceDollar, FaDollarSign, FaChartBar, FaCalendarAlt, FaUsers, FaCar, FaHotel, FaTaxi, FaPiggyBank, FaChartPie, FaBalanceScale, FaFileAlt, FaDownload, FaPrint, FaEye, FaEdit, FaTrash, FaPlus, FaMinus, FaPercentage, FaClock, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTable, FaSave, FaUndo, FaInfoCircle, FaCompress, FaExpand } from 'react-icons/fa';
import { useUser } from '../../UserContext';
import * as ExcelJS from 'exceljs';

function formatRWF(num: number | undefined | null) {
  if (num === undefined || num === null || isNaN(num)) {
    return '0 RWF';
  }
  return num.toLocaleString('en-US') + ' RWF';
}



function calculatePercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

// Mock financial data structure
  const mockFinancialData = {
    openingBalances: {
      mtnMomoRWF: 10900.00,
      equityBankRWF: 1500000.00,
      bkBankRWF: 598129.00
    },
    income: [
      { id: 1, description: 'Debit from Gi.Masta(MTN Momo)', mtnMomoRWF: 384000.00, equityBankRWF: 0, bkBankRWF: 0, date: '2025-01-16' },
      { id: 2, description: 'Hotel Booking Revenue', mtnMomoRWF: 0, equityBankRWF: 150000.00, bkBankRWF: 100000.00, date: '2025-01-17' },
      { id: 3, description: 'Car Rental Payment', mtnMomoRWF: 180000.00, equityBankRWF: 0, bkBankRWF: 0, date: '2025-01-18' },
      { id: 4, description: 'Taxi Service Revenue', mtnMomoRWF: 45000.00, equityBankRWF: 0, bkBankRWF: 0, date: '2025-01-19' },
      { id: 5, description: 'Tour Package Revenue', mtnMomoRWF: 320000.00, equityBankRWF: 0, bkBankRWF: 0, date: '2025-01-20' }
    ],
    expenses: [
      { id: 1, description: 'Fuel for Toyota Coaster', mtnMomoRWF: 45000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'FUEL', date: '2025-01-15' },
      { id: 2, description: 'Fuel for Land Cruiser', mtnMomoRWF: 38000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'FUEL', date: '2025-01-16' },
      { id: 3, description: 'Vehicle Insurance Premium', mtnMomoRWF: 0, equityBankRWF: 150000.00, bkBankRWF: 0, category: 'INSURANCE', date: '2025-01-17' },
      { id: 4, description: 'Monthly Payroll - All Employees', mtnMomoRWF: 0, equityBankRWF: 300000.00, bkBankRWF: 220000.00, category: 'PAYROLL', date: '2025-01-18' },
      { id: 5, description: 'Hotel Booking Commission', mtnMomoRWF: 25000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'HOTEL ACCOMMODATION', date: '2025-01-19' },
      { id: 6, description: 'Office Supplies', mtnMomoRWF: 12000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'OFFICE EXPENSES', date: '2025-01-20' },
      { id: 7, description: 'Petty Cash - Driver Allowance', mtnMomoRWF: 15000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'PETTY CASH', date: '2025-01-21' },
      { id: 8, description: 'Engine Oil Change', mtnMomoRWF: 25000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'MAINTENANCE', date: '2025-01-22' },
      { id: 9, description: 'Brake Pad Replacement', mtnMomoRWF: 35000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'MAINTENANCE', date: '2025-01-23' },
      { id: 10, description: 'Tire Replacement', mtnMomoRWF: 0, equityBankRWF: 120000.00, bkBankRWF: 0, category: 'MAINTENANCE', date: '2025-01-24' },
      { id: 11, description: 'Vehicle Repair - Engine', mtnMomoRWF: 75000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'VEHICLE REPAIRS', date: '2025-01-25' },
      { id: 12, description: 'Carwash - Toyota Coaster', mtnMomoRWF: 5000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'CARWASH', date: '2025-01-26' },
      { id: 13, description: 'Carwash - Land Cruiser', mtnMomoRWF: 4000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'CARWASH', date: '2025-01-27' },
      { id: 14, description: 'Carwash - All Vehicles', mtnMomoRWF: 8000.00, equityBankRWF: 0, bkBankRWF: 0, category: 'CARWASH', date: '2025-01-28' }
    ]
  };

  // Payroll and Employee Data
  const mockPayrollData = {
    employees: [
      {
        id: 1,
        name: 'John Doe',
        position: 'Driver',
        employeeId: 'KIMUDRV001',
        salary: 80000,
        allowances: 0,
        deductions: 0,
        netSalary: 80000,
        status: 'active',
        joinDate: '2024-01-15',
        bankAccount: '1234567890',
        phone: '+250788123456'
      },
      {
        id: 2,
        name: 'Jane Smith',
        position: 'Sales & Marketing Agent',
        employeeId: 'KIMUSMA001',
        salary: 70000,
        allowances: 0,
        deductions: 0,
        netSalary: 70000,
        status: 'active',
        joinDate: '2024-02-01',
        bankAccount: '0987654321',
        phone: '+250788654321'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        position: 'Driver',
        employeeId: 'KIMUDRV002',
        salary: 75000,
        allowances: 0,
        deductions: 0,
        netSalary: 75000,
        status: 'active',
        joinDate: '2024-01-20',
        bankAccount: '1122334455',
        phone: '+250788111222'
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        position: 'Transport Officer',
        employeeId: 'KIMUTRO001',
        salary: 85000,
        allowances: 0,
        deductions: 0,
        netSalary: 85000,
        status: 'active',
        joinDate: '2024-03-10',
        bankAccount: '5566778899',
        phone: '+250788333444'
      },
      {
        id: 5,
        name: 'David Brown',
        position: 'Manager',
        employeeId: 'KIMUMGR001',
        salary: 120000,
        allowances: 0,
        deductions: 0,
        netSalary: 120000,
        status: 'active',
        joinDate: '2024-01-01',
        bankAccount: '9988776655',
        phone: '+250788555666'
      },
      {
        id: 6,
        name: 'Mary Johnson',
        position: 'Accountant',
        employeeId: 'KIMUACC001',
        salary: 90000,
        allowances: 0,
        deductions: 0,
        netSalary: 90000,
        status: 'active',
        joinDate: '2024-02-15',
        bankAccount: '1122334455',
        phone: '+250788777888'
      }
    ],
    payrollHistory: [
      {
        id: 1,
        month: 'January 2025',
        totalSalary: 520000,
        totalAllowances: 0,
        totalDeductions: 0,
        netPayroll: 520000,
        status: 'paid',
        paymentDate: '2025-01-31'
      },
      {
        id: 2,
        month: 'December 2024',
        totalSalary: 520000,
        totalAllowances: 0,
        totalDeductions: 0,
        netPayroll: 520000,
        status: 'paid',
        paymentDate: '2024-12-31'
      }
    ]
  };

export default function AccountantDashboard() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  // Ensure all data has the correct structure with both bank accounts
  const ensureDataStructure = (data: any) => {
    return {
      ...data,
      income: data.income.map((item: any) => ({
        ...item,
        mtnMomoRWF: item.mtnMomoRWF ?? item.cashRWF ?? 0,
        equityBankRWF: item.equityBankRWF ?? item.bankRWF ?? 0,
        bkBankRWF: item.bkBankRWF ?? 0
      })),
      expenses: data.expenses.map((item: any) => ({
        ...item,
        mtnMomoRWF: item.mtnMomoRWF ?? item.cashRWF ?? 0,
        equityBankRWF: item.equityBankRWF ?? item.bankRWF ?? 0,
        bkBankRWF: item.bkBankRWF ?? 0
      }))
    };
  };

  const [financialData, setFinancialData] = useState(ensureDataStructure(mockFinancialData));
  const [payrollData, setPayrollData] = useState(mockPayrollData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [editingRow, setEditingRow] = useState<any>(null);
  const [showViewIncomeModal, setShowViewIncomeModal] = useState(false);
  const [showViewExpensesModal, setShowViewExpensesModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [minimizedModals, setMinimizedModals] = useState<{[key: string]: boolean}>({});
  const [editingMode, setEditingMode] = useState<{[key: string]: boolean}>({});
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'ledger' | 'summary' | 'reports' | 'payroll'>('ledger');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login');
    } else if (!isLoading && user && user.role !== 'accountant') {
      // Log unauthorized access attempt for security monitoring
      console.warn(`SECURITY ALERT: Unauthorized access attempt to accountant dashboard by user: ${user.username} (role: ${user.role}) at ${new Date().toISOString()}`);
      router.push('/staff/dashboard');
    }
  }, [router, user, isLoading]);

  // Filter data based on time period
  const filterDataByTime = (data: any[], filter: string, date: string) => {
    if (filter === 'all') return data;
    
    const selectedDate = new Date(date);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDay = selectedDate.getDate();
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth();
      const itemDay = itemDate.getDate();
      
      switch (filter) {
        case 'daily':
          return itemYear === selectedYear && itemMonth === selectedMonth && itemDay === selectedDay;
        case 'weekly':
          const weekStart = new Date(selectedDate);
          weekStart.setDate(selectedDay - selectedDate.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return itemDate >= weekStart && itemDate <= weekEnd;
        case 'monthly':
          return itemYear === selectedYear && itemMonth === selectedMonth;
        case 'yearly':
          return itemYear === selectedYear;
        default:
          return true;
      }
    });
  };

  const filteredIncome = filterDataByTime(financialData.income, timeFilter, selectedDate);
  const filteredExpenses = filterDataByTime(financialData.expenses, timeFilter, selectedDate);

  // Calculate totals based on filtered data
  const totalIncomeRWF = filteredIncome.reduce((sum, item) => 
    sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0), 0);
  const totalExpenseRWF = filteredExpenses.reduce((sum, item) => 
    sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0), 0);

  // Calculate opening balances based on the time filter period
  const calculateOpeningBalances = (date: string, filter: string) => {
    try {
      const selectedDate = new Date(date);
      
      // Check if the date is valid
      if (isNaN(selectedDate.getTime())) {
        console.error('Invalid date:', date);
        return financialData.openingBalances;
      }
      
      // Calculate the start of the filtered period
      let periodStart: Date;
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedDay = selectedDate.getDate();
      
      switch (filter) {
        case 'daily':
          // For daily view, opening balance is from the previous day
          periodStart = new Date(selectedDate);
          periodStart.setDate(selectedDay - 1);
          break;
        case 'weekly':
          // For weekly view, opening balance is from the start of the previous week
          periodStart = new Date(selectedDate);
          periodStart.setDate(selectedDay - selectedDate.getDay() - 7);
          break;
        case 'monthly':
          // For monthly view, opening balance is from the start of the previous month
          periodStart = new Date(selectedYear, selectedMonth - 1, 1);
          break;
        case 'yearly':
          // For yearly view, opening balance is from the start of the previous year
          periodStart = new Date(selectedYear - 1, 0, 1);
          break;
        default:
          // For 'all' view, opening balance is the base opening balance
          return financialData.openingBalances;
      }
      
      // Check if the period start is valid
      if (isNaN(periodStart.getTime())) {
        console.error('Invalid period start calculated');
        return financialData.openingBalances;
      }
      
      // Get all transactions up to the period start
      const previousIncome = financialData.income.filter(item => {
        const itemDate = new Date(item.date);
        return !isNaN(itemDate.getTime()) && itemDate < periodStart;
      });
      
      const previousExpenses = financialData.expenses.filter(item => {
        const itemDate = new Date(item.date);
        return !isNaN(itemDate.getTime()) && itemDate < periodStart;
      });
      
      return {
        mtnMomoRWF: financialData.openingBalances.mtnMomoRWF + 
          previousIncome.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0) - 
          previousExpenses.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0),
        equityBankRWF: financialData.openingBalances.equityBankRWF + 
          previousIncome.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0) - 
          previousExpenses.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0),
        bkBankRWF: financialData.openingBalances.bkBankRWF + 
          previousIncome.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0) - 
          previousExpenses.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0)
      };
    } catch (error) {
      console.error('Error calculating opening balances:', error);
      return financialData.openingBalances;
    }
  };

  const openingBalances = calculateOpeningBalances(selectedDate, timeFilter);

  // Calculate closing balances based on the same filtered data
  const closingBalances = {
    mtnMomoRWF: openingBalances.mtnMomoRWF + 
      filteredIncome.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0) - 
      filteredExpenses.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0),
    equityBankRWF: openingBalances.equityBankRWF + 
      filteredIncome.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0) - 
      filteredExpenses.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0),
    bkBankRWF: openingBalances.bkBankRWF + 
      filteredIncome.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0) - 
      filteredExpenses.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0)
  };

    // Add new transaction with security logging
  const addTransaction = (type: 'income' | 'expense', data: any) => {
    // Security audit log
    const auditLog = {
      action: 'ADD_TRANSACTION',
      type: type,
      user: user?.username,
      timestamp: new Date().toISOString(),
      data: {
        description: data.description,
        mtnMomoRWF: data.mtnMomoRWF || 0,
        equityBankRWF: data.equityBankRWF || 0,
        bkBankRWF: data.bkBankRWF || 0,
        category: data.category || 'OTHER',
        date: data.date || new Date().toISOString().split('T')[0]
      }
    };
    
    console.log('SECURITY AUDIT:', auditLog);
    
    if (type === 'income') {
      const newIncome = {
        id: Date.now(),
        description: data.description,
        mtnMomoRWF: data.mtnMomoRWF || 0,
        equityBankRWF: data.equityBankRWF || 0,
        bkBankRWF: data.bkBankRWF || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        createdBy: user?.username,
        createdAt: new Date().toISOString()
      };
      setFinancialData(prev => ({
        ...prev,
        income: [...prev.income, newIncome]
      }));
    } else {
      const newExpense = {
        id: Date.now(),
        description: data.description,
        mtnMomoRWF: data.mtnMomoRWF || 0,
        equityBankRWF: data.equityBankRWF || 0,
        bkBankRWF: data.bkBankRWF || 0,
        category: data.category || 'OTHER',
        date: data.date || new Date().toISOString().split('T')[0],
        createdBy: user?.username,
        createdAt: new Date().toISOString()
      };
      setFinancialData(prev => ({
        ...prev,
        expenses: [...prev.expenses, newExpense]
      }));
    }
    setShowAddModal(false);
  };

  // View transaction details
  const viewTransactionDetails = (transaction: any, type: 'income' | 'expense') => {
    setSelectedTransaction({ ...transaction, type });
    setShowTransactionModal(true);
  };

  // View employee details
  const viewEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  // View payroll details
  const viewPayrollDetails = (payroll: any) => {
    setSelectedPayroll(payroll);
    setShowPayrollModal(true);
  };

  // Toggle modal minimize state
  const toggleModalMinimize = (modalKey: string) => {
    setMinimizedModals(prev => ({
      ...prev,
      [modalKey]: !prev[modalKey]
    }));
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent, modalType: string) => {
    if (e.target === e.currentTarget) {
      switch (modalType) {
        case 'employee':
          setShowEmployeeModal(false);
          break;
        case 'payroll':
          setShowPayrollModal(false);
          break;
        case 'transaction':
          setShowTransactionModal(false);
          break;
        case 'add':
          setShowAddModal(false);
          break;
        case 'viewIncome':
          setShowViewIncomeModal(false);
          break;
        case 'viewExpenses':
          setShowViewExpensesModal(false);
          break;
        case 'addEmployee':
          setShowAddEmployeeModal(false);
          break;
      }
    }
  };

  // Toggle edit mode for modals
  const toggleEditMode = (modalKey: string) => {
    setEditingMode(prev => ({
      ...prev,
      [modalKey]: !prev[modalKey]
    }));
  };

  // Save changes for employee
  const saveEmployeeChanges = (employeeId: number, updatedData: any) => {
    setPayrollData(prev => ({
      ...prev,
      employees: prev.employees.map(emp => 
        emp.id === employeeId ? { ...emp, ...updatedData } : emp
      )
    }));
    setEditingMode(prev => ({ ...prev, employee: false }));
  };

  // Save changes for transaction
  const saveTransactionChanges = (transactionId: number, type: 'income' | 'expense', updatedData: any) => {
    setFinancialData(prev => ({
      ...prev,
      [type === 'income' ? 'income' : 'expenses']: prev[type === 'income' ? 'income' : 'expenses'].map(item =>
        item.id === transactionId ? { ...item, ...updatedData } : item
      )
    }));
    setEditingMode(prev => ({ ...prev, transaction: false }));
  };

  // Delete transaction with security logging
  const deleteTransaction = (type: 'income' | 'expense', id: number) => {
    // Security audit log
    const auditLog = {
      action: 'DELETE_TRANSACTION',
      type: type,
      user: user?.username,
      timestamp: new Date().toISOString(),
      transactionId: id
    };
    
    console.log('SECURITY AUDIT:', auditLog);
    
    if (type === 'income') {
      setFinancialData(prev => ({
        ...prev,
        income: prev.income.filter(item => item.id !== id)
      }));
    } else {
      setFinancialData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(item => item.id !== id)
      }));
    }
  };

  // Generate sophisticated employee ID based on position
  const generateEmployeeId = (position: string) => {
    const positionCodes: { [key: string]: string } = {
      'Manager': 'MGR',
      'Accountant': 'ACC',
      'Sales & Marketing Agent': 'SMA',
      'Transport Officer': 'TRO',
      'Driver': 'DRV'
    };
    
    const code = positionCodes[position] || 'EMP';
    const existingEmployees = payrollData.employees.filter(emp => 
      emp.employeeId.startsWith(`KIMU${code}`)
    );
    const sequence = existingEmployees.length + 1;
    
    return `KIMU${code}${String(sequence).padStart(3, '0')}`;
  };

  // Payroll functions
  const addEmployee = (employeeData: any) => {
    const auditLog = {
      action: 'ADD_EMPLOYEE',
      user: user?.username,
      timestamp: new Date().toISOString(),
      employeeData: employeeData
    };
    
    console.log('SECURITY AUDIT:', auditLog);
    
    const newEmployee = {
      id: Date.now(),
      ...employeeData,
      employeeId: generateEmployeeId(employeeData.position),
      allowances: 0,
      deductions: 0,
      netSalary: employeeData.salary,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setPayrollData(prev => ({
      ...prev,
      employees: [...prev.employees, newEmployee]
    }));
    
    setShowAddEmployeeModal(false);
  };

  const processPayroll = () => {
    const auditLog = {
      action: 'PROCESS_PAYROLL',
      user: user?.username,
      timestamp: new Date().toISOString(),
      month: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    };
    
    console.log('SECURITY AUDIT:', auditLog);
    
    const totalSalary = payrollData.employees.reduce((sum, emp) => sum + emp.salary, 0);
    const netPayroll = totalSalary; // No allowances or deductions
    
    const newPayroll = {
      id: Date.now(),
      month: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      totalSalary,
      totalAllowances: 0,
      totalDeductions: 0,
      netPayroll,
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0]
    };
    
    setPayrollData(prev => ({
      ...prev,
      payrollHistory: [newPayroll, ...prev.payrollHistory]
    }));
    
    setShowPayrollModal(false);
  };

  const deleteEmployee = (id: number) => {
    const auditLog = {
      action: 'DELETE_EMPLOYEE',
      user: user?.username,
      timestamp: new Date().toISOString(),
      employeeId: id
    };
    
    console.log('SECURITY AUDIT:', auditLog);
    
    setPayrollData(prev => ({
      ...prev,
      employees: prev.employees.filter(emp => emp.id !== id)
    }));
  };

  // Export to Excel/CSV with security logging
  const exportToExcel = () => {
    // Security audit log
    const auditLog = {
      action: 'EXPORT_FINANCIAL_DATA',
      user: user?.username,
      timestamp: new Date().toISOString(),
      timeFilter: timeFilter,
      selectedDate: selectedDate
    };
    
    console.log('SECURITY AUDIT:', auditLog);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Financial Ledger');

    // Set column widths
    worksheet.getColumn('A').width = 18;
    worksheet.getColumn('B').width = 45;
    worksheet.getColumn('C').width = 18;
    worksheet.getColumn('D').width = 18;
    worksheet.getColumn('E').width = 25;
    worksheet.getColumn('F').width = 15;

    // Add company branding header
    const headerRow1 = worksheet.addRow(['']);
    headerRow1.height = 35;
    const headerRow2 = worksheet.addRow(['']);
    headerRow2.height = 35;

    // Add company logo placeholder and title
    const titleRow = worksheet.addRow(['KIMU TRANSPORT & MULTISERVICES LTD']);
    titleRow.height = 30;
    titleRow.getCell('A').font = { bold: true, size: 20, color: { argb: 'FF1F4E79' } };
    titleRow.getCell('A').alignment = { horizontal: 'center' };
    worksheet.mergeCells('A3:F3');

    const subtitleRow = worksheet.addRow(['COMPREHENSIVE FINANCIAL LEDGER REPORT']);
    subtitleRow.height = 25;
    subtitleRow.getCell('A').font = { bold: true, size: 16, color: { argb: 'FF2E7D32' } };
    subtitleRow.getCell('A').alignment = { horizontal: 'center' };
    worksheet.mergeCells('A4:F4');

    // Add report metadata
    worksheet.addRow(['']);
    const metadataRow1 = worksheet.addRow(['Report Generated:', new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), '', 'Generated By:', user?.fullName || user?.username || 'Accountant']);
    metadataRow1.getCell('A').font = { bold: true, color: { argb: 'FF666666' } };
    metadataRow1.getCell('D').font = { bold: true, color: { argb: 'FF666666' } };
    worksheet.mergeCells('B6:C6');
    worksheet.mergeCells('E6:F6');

    const metadataRow2 = worksheet.addRow(['Time Period:', timeFilter === 'all' ? 'All Time' : 
      timeFilter === 'daily' ? `Daily - ${selectedDate}` :
      timeFilter === 'weekly' ? 'Weekly' :
      timeFilter === 'monthly' ? 'Monthly' : 'Yearly', '', 'Report Type:', 'Financial Ledger']);
    metadataRow2.getCell('A').font = { bold: true, color: { argb: 'FF666666' } };
    metadataRow2.getCell('D').font = { bold: true, color: { argb: 'FF666666' } };
    worksheet.mergeCells('B7:C7');
    worksheet.mergeCells('E7:F7');
    worksheet.addRow(['']);

    // Add executive summary
    const summaryTitle = worksheet.addRow(['EXECUTIVE SUMMARY']);
    summaryTitle.height = 25;
    summaryTitle.getCell('A').font = { bold: true, size: 14, color: { argb: 'FF1F4E79' } };
    summaryTitle.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    worksheet.mergeCells('A9:F9');

    const summaryData = [
      ['Total Income (RWF)', filteredIncome.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0).toLocaleString()],
      ['Total Expenses (RWF)', filteredExpenses.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0).toLocaleString()],
      ['Net Profit/Loss (RWF)', (filteredIncome.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0) - filteredExpenses.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0)).toLocaleString()],
      ['Total Transactions', (filteredIncome.length + filteredExpenses.length).toString()]
    ];

    summaryData.forEach(([label, value], index) => {
      const row = worksheet.addRow([label, value]);
      row.getCell('A').font = { bold: true, color: { argb: 'FF424242' } };
      row.getCell('B').font = { bold: true, color: { argb: index === 2 ? 'FF2E7D32' : 'FF424242' } };
      if (index === 2) {
        row.getCell('B').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
      }
    });
    worksheet.addRow(['']);

    // Add opening balances section with enhanced styling
    const openingTitle = worksheet.addRow(['OPENING BALANCES']);
    openingTitle.height = 25;
    openingTitle.getCell('A').font = { bold: true, size: 14, color: { argb: 'FF1976D2' } };
    openingTitle.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    worksheet.mergeCells('A' + (15 + summaryData.length) + ':F' + (15 + summaryData.length));

    const openingHeaders = worksheet.addRow(['Account Type', 'Cash RWF', 'Bank RWF', 'Total RWF']);
    openingHeaders.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF424242' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });

    const openingValues = worksheet.addRow([
      'Opening Balance',
      openingBalances.mtnMomoRWF.toLocaleString(),
      openingBalances.equityBankRWF.toLocaleString(),
      openingBalances.bkBankRWF.toLocaleString(),
      (openingBalances.mtnMomoRWF + openingBalances.equityBankRWF + openingBalances.bkBankRWF).toLocaleString()
    ]);
    openingValues.getCell('A').font = { bold: true, color: { argb: 'FF1976D2' } };
    openingValues.getCell('B').font = { bold: true, color: { argb: 'FF2E7D32' } };
    openingValues.getCell('C').font = { bold: true, color: { argb: 'FF1976D2' } };
    openingValues.getCell('D').font = { bold: true, color: { argb: 'FF1F4E79' } };
    worksheet.addRow(['']);

    // Add income section with enhanced styling
    const incomeTitle = worksheet.addRow(['INCOME TRANSACTIONS']);
    incomeTitle.height = 25;
    incomeTitle.getCell('A').font = { bold: true, size: 14, color: { argb: 'FF2E7D32' } };
    incomeTitle.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
    worksheet.mergeCells('A' + (19 + summaryData.length) + ':F' + (19 + summaryData.length));

    const incomeHeaders = worksheet.addRow(['Date', 'Description', 'MTN Momo RWF', 'Equity Bank RWF', 'BK Bank RWF', 'Total RWF', 'Category']);
    incomeHeaders.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF424242' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });

    // Add income data with formulas
    filteredIncome.forEach((item, index) => {
      const row = worksheet.addRow([
        item.date,
        item.description,
        item.mtnMomoRWF > 0 ? item.mtnMomoRWF.toLocaleString() : '',
        item.equityBankRWF > 0 ? item.equityBankRWF.toLocaleString() : '',
        item.bkBankRWF > 0 ? item.bkBankRWF.toLocaleString() : '',
        (item.mtnMomoRWF + item.equityBankRWF + item.bkBankRWF).toLocaleString(),
        'Income'
      ]);
      row.getCell('C').font = { color: { argb: 'FF2E7D32' } };
      row.getCell('D').font = { color: { argb: 'FF2E7D32' } };
      row.getCell('E').font = { color: { argb: 'FF2E7D32' } };
      row.getCell('F').font = { bold: true, color: { argb: 'FF2E7D32' } };
    });

    // Add income total with formula
    const incomeTotalRow = worksheet.addRow(['TOTAL INCOME', '',
      filteredIncome.reduce((sum, item) => sum + item.mtnMomoRWF, 0).toLocaleString(),
      filteredIncome.reduce((sum, item) => sum + item.equityBankRWF, 0).toLocaleString(),
      filteredIncome.reduce((sum, item) => sum + item.bkBankRWF, 0).toLocaleString(),
      filteredIncome.reduce((sum, item) => sum + item.mtnMomoRWF + item.equityBankRWF + item.bkBankRWF, 0).toLocaleString(),
      ''
    ]);
    incomeTotalRow.getCell('A').font = { bold: true, color: { argb: 'FF2E7D32' } };
    incomeTotalRow.getCell('C').font = { bold: true, color: { argb: 'FF2E7D32' } };
    incomeTotalRow.getCell('D').font = { bold: true, color: { argb: 'FF2E7D32' } };
    incomeTotalRow.getCell('E').font = { bold: true, color: { argb: 'FF2E7D32' } };
    incomeTotalRow.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
    incomeTotalRow.getCell('C').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
    incomeTotalRow.getCell('D').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
    incomeTotalRow.getCell('E').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E8' } };
    worksheet.addRow(['']);

    // Add expenses section with enhanced styling
    const expenseTitle = worksheet.addRow(['EXPENSE TRANSACTIONS']);
    expenseTitle.height = 25;
    expenseTitle.getCell('A').font = { bold: true, size: 14, color: { argb: 'FFD32F2F' } };
    expenseTitle.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
    worksheet.mergeCells('A' + (22 + summaryData.length + filteredIncome.length) + ':F' + (22 + summaryData.length + filteredIncome.length));

    const expenseHeaders = worksheet.addRow(['Date', 'Description', 'MTN Momo RWF', 'Equity Bank RWF', 'BK Bank RWF', 'Total RWF', 'Category']);
    expenseHeaders.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF424242' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });

    // Add expense data with formulas
    filteredExpenses.forEach((item, index) => {
      const row = worksheet.addRow([
        item.date,
        item.description,
        item.mtnMomoRWF > 0 ? item.mtnMomoRWF.toLocaleString() : '',
        item.equityBankRWF > 0 ? item.equityBankRWF.toLocaleString() : '',
        item.bkBankRWF > 0 ? item.bkBankRWF.toLocaleString() : '',
        (item.mtnMomoRWF + item.equityBankRWF + item.bkBankRWF).toLocaleString(),
        item.category
      ]);
      row.getCell('C').font = { color: { argb: 'FFD32F2F' } };
      row.getCell('D').font = { color: { argb: 'FFD32F2F' } };
      row.getCell('E').font = { color: { argb: 'FFD32F2F' } };
      row.getCell('F').font = { bold: true, color: { argb: 'FFD32F2F' } };
    });

    // Add expense total with formula
    const expenseTotalRow = worksheet.addRow(['TOTAL EXPENSES', '',
      filteredExpenses.reduce((sum, item) => sum + item.mtnMomoRWF, 0).toLocaleString(),
      filteredExpenses.reduce((sum, item) => sum + item.equityBankRWF, 0).toLocaleString(),
      filteredExpenses.reduce((sum, item) => sum + item.bkBankRWF, 0).toLocaleString(),
      filteredExpenses.reduce((sum, item) => sum + item.mtnMomoRWF + item.equityBankRWF + item.bkBankRWF, 0).toLocaleString(),
      ''
    ]);
    expenseTotalRow.getCell('A').font = { bold: true, color: { argb: 'FFD32F2F' } };
    expenseTotalRow.getCell('C').font = { bold: true, color: { argb: 'FFD32F2F' } };
    expenseTotalRow.getCell('D').font = { bold: true, color: { argb: 'FFD32F2F' } };
    expenseTotalRow.getCell('E').font = { bold: true, color: { argb: 'FFD32F2F' } };
    expenseTotalRow.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
    expenseTotalRow.getCell('C').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
    expenseTotalRow.getCell('D').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
    expenseTotalRow.getCell('E').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
    worksheet.addRow(['']);

    // Add closing balances section with enhanced styling
    const closingTitle = worksheet.addRow(['CLOSING BALANCES']);
    closingTitle.height = 25;
    closingTitle.getCell('A').font = { bold: true, size: 14, color: { argb: 'FF7B1FA2' } };
    closingTitle.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E5F5' } };
    worksheet.mergeCells('A' + (25 + summaryData.length + filteredIncome.length + filteredExpenses.length) + ':F' + (25 + summaryData.length + filteredIncome.length + filteredExpenses.length));

    const closingHeaders = worksheet.addRow(['Account Type', 'Cash RWF', 'Bank RWF', 'Total RWF']);
    closingHeaders.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FF424242' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    });

    const closingValues = worksheet.addRow([
      'Closing Balance',
      closingBalances.mtnMomoRWF.toLocaleString(),
      closingBalances.equityBankRWF.toLocaleString(),
      closingBalances.bkBankRWF.toLocaleString(),
      (closingBalances.mtnMomoRWF + closingBalances.equityBankRWF + closingBalances.bkBankRWF).toLocaleString()
    ]);
    closingValues.getCell('A').font = { bold: true, color: { argb: 'FF7B1FA2' } };
    closingValues.getCell('B').font = { bold: true, color: { argb: 'FF2E7D32' } };
    closingValues.getCell('C').font = { bold: true, color: { argb: 'FF1976D2' } };
    closingValues.getCell('D').font = { bold: true, color: { argb: 'FF7B1FA2' } };

    // Add financial analysis section
    worksheet.addRow(['']);
    const analysisTitle = worksheet.addRow(['FINANCIAL ANALYSIS']);
    analysisTitle.height = 25;
    analysisTitle.getCell('A').font = { bold: true, size: 14, color: { argb: 'FF1F4E79' } };
    analysisTitle.getCell('A').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
    worksheet.mergeCells('A' + (28 + summaryData.length + filteredIncome.length + filteredExpenses.length) + ':F' + (28 + summaryData.length + filteredIncome.length + filteredExpenses.length));

    const analysisData = [
      ['Profit Margin (%)', ((filteredIncome.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0) - filteredExpenses.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0)) / filteredIncome.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0) * 100).toFixed(2) + '%'],
      ['Expense Ratio (%)', (filteredExpenses.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0) / filteredIncome.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0) * 100).toFixed(2) + '%'],
      ['Cash Flow Ratio', (closingBalances.cashRWF / (filteredExpenses.reduce((sum, item) => sum + item.cashRWF + item.bankRWF, 0) || 1)).toFixed(2)],
      ['Transaction Count', (filteredIncome.length + filteredExpenses.length).toString()]
    ];

    analysisData.forEach(([label, value], index) => {
      const row = worksheet.addRow([label, value]);
      row.getCell('A').font = { bold: true, color: { argb: 'FF424242' } };
      row.getCell('B').font = { bold: true, color: { argb: 'FF2E7D32' } };
    });

    // Add footer with company information
    worksheet.addRow(['']);
    worksheet.addRow(['']);
    const footerRow1 = worksheet.addRow(['KIMU TRANSPORT & MULTISERVICES LTD - Financial Report']);
    footerRow1.getCell('A').font = { italic: true, color: { argb: 'FF666666' } };
    footerRow1.getCell('A').alignment = { horizontal: 'center' };
    worksheet.mergeCells('A' + (32 + summaryData.length + filteredIncome.length + filteredExpenses.length + analysisData.length) + ':F' + (32 + summaryData.length + filteredIncome.length + filteredExpenses.length + analysisData.length));

    const footerRow2 = worksheet.addRow(['This report was generated automatically by the KIMU Financial Management System']);
    footerRow2.getCell('A').font = { italic: true, color: { argb: 'FF999999' } };
    footerRow2.getCell('A').alignment = { horizontal: 'center' };
    worksheet.mergeCells('A' + (33 + summaryData.length + filteredIncome.length + filteredExpenses.length + analysisData.length) + ':F' + (33 + summaryData.length + filteredIncome.length + filteredExpenses.length + analysisData.length));

    // Add comprehensive borders and styling
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
    });

    // Add conditional formatting for positive/negative values
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (colNumber === 3 || colNumber === 4 || colNumber === 5) { // Cash, Bank, Total columns
          const value = parseFloat(cell.value?.toString().replace(/,/g, '') || '0');
          if (value > 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8F0' } };
          }
        }
      });
    });

    // Generate and download the file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kimu-financial-ledger-${timeFilter}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Strict access control - only accountant can view this page
  if (!user || user.role !== 'accountant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-8 rounded-lg shadow-lg">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="mb-4">You do not have permission to access the accountant dashboard.</p>
            <p className="text-sm mb-6">Only accountant users can view financial data.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/staff/dashboard')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => router.push('/staff/login')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Login as Accountant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1 max-w-full mx-auto p-8 flex flex-col gap-8">
        {/* Security Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
                Financial Ledger - {user?.fullName || user?.username || 'Accountant'}
          </h2>
              <p className="text-gray-600">Comprehensive financial tracking and management system</p>
            </div>
            <div className="text-right">
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                <div className="font-semibold">🔒 Secure Session</div>
                <div>User: {user?.username}</div>
                <div>Role: {user?.role}</div>
                <div>Session: {new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'ledger' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaTable className="inline mr-2" />
              Financial Ledger
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Summary
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'payroll' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUsers className="inline mr-2" />
              Payroll
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-yellow-800">Data Protection Notice</span>
          </div>
          <p className="text-sm text-yellow-700">
            This financial data is protected and monitored. All actions are logged for security purposes. 
            Only authorized accountant users can access this information.
          </p>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              <span className="font-semibold text-gray-700">Time Period:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter('daily')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeFilter('weekly')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === 'weekly' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeFilter('monthly')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === 'monthly' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeFilter('yearly')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === 'yearly' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Yearly
              </button>
            </div>
            {timeFilter === 'daily' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Select Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  title="Set to today"
                >
                  Today
                </button>
              </div>
            )}
            {(timeFilter === 'weekly' || timeFilter === 'monthly' || timeFilter === 'yearly') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Starting Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          {timeFilter !== 'all' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <FaInfoCircle className="inline mr-1" />
                Showing data for: <span className="font-semibold">
                  {timeFilter === 'daily' && `Daily view for ${(() => {
                    try {
                      const date = new Date(selectedDate);
                      if (isNaN(date.getTime())) return 'Invalid Date';
                      return date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    } catch (error) {
                      return 'Invalid Date';
                    }
                  })()}`}
                  {timeFilter === 'weekly' && `Weekly view starting ${(() => {
                    try {
                      const date = new Date(selectedDate);
                      if (isNaN(date.getTime())) return 'Invalid Date';
                      return date.toLocaleDateString();
                    } catch (error) {
                      return 'Invalid Date';
                    }
                  })()}`}
                  {timeFilter === 'monthly' && `Monthly view for ${(() => {
                    try {
                      const date = new Date(selectedDate);
                      if (isNaN(date.getTime())) return 'Invalid Date';
                      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    } catch (error) {
                      return 'Invalid Date';
                    }
                  })()}`}
                  {timeFilter === 'yearly' && `Yearly view for ${(() => {
                    try {
                      const date = new Date(selectedDate);
                      if (isNaN(date.getTime())) return 'Invalid Year';
                      return date.getFullYear();
                    } catch (error) {
                      return 'Invalid Year';
                    }
                  })()}`}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Financial Ledger Tab */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            {/* Opening Balances */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Opening Balances
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Cash (RWF)</div>
                  <div className="text-xl font-bold text-orange-700">{formatRWF(openingBalances.cashRWF)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Bank (RWF)</div>
                  <div className="text-xl font-bold text-purple-700">{formatRWF(openingBalances.bankRWF)}</div>
                </div>
              </div>
            </div>

            {/* Income Section */}
          <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaChartLine className="text-green-600" />
                  Income
            </h3>
                <button
                  onClick={() => { setModalType('income'); setShowAddModal(true); }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  Add Income
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">MTN Momo RWF</th>
                      <th className="py-3 px-4">Equity Bank RWF</th>
                      <th className="py-3 px-4">BK Bank RWF</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncome.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => viewTransactionDetails(item, 'income')}>
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4 font-medium">{item.description}</td>
                        <td className="py-3 px-4">{item.mtnMomoRWF > 0 ? formatRWF(item.mtnMomoRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.equityBankRWF > 0 ? formatRWF(item.equityBankRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.bkBankRWF > 0 ? formatRWF(item.bkBankRWF) : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewTransactionDetails(item, 'income');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTransaction('income', item.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
        </div>

            {/* Expenses Section */}
        <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaCalculator className="text-red-600" />
                  Expenses
          </h3>
                <button
                  onClick={() => { setModalType('expense'); setShowAddModal(true); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  Add Expense
                </button>
              </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b">
                  <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">MTN Momo RWF</th>
                      <th className="py-3 px-4">Equity Bank RWF</th>
                      <th className="py-3 px-4">BK Bank RWF</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                    {filteredExpenses.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => viewTransactionDetails(item, 'expense')}>
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4 font-medium">{item.description}</td>
                        <td className="py-3 px-4">{item.mtnMomoRWF > 0 ? formatRWF(item.mtnMomoRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.equityBankRWF > 0 ? formatRWF(item.equityBankRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.bkBankRWF > 0 ? formatRWF(item.bkBankRWF) : '-'}</td>
                    <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {item.category}
                      </span>
                    </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewTransactionDetails(item, 'expense');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTransaction('expense', item.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

            {/* Closing Balances */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaBalanceScale className="text-blue-600" />
                Closing Balances
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">MTN Momo (RWF)</div>
                  <div className="text-xl font-bold text-orange-700">{formatRWF(closingBalances.mtnMomoRWF)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Equity Bank (RWF)</div>
                  <div className="text-xl font-bold text-purple-700">{formatRWF(closingBalances.equityBankRWF)}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">BK Bank (RWF)</div>
                  <div className="text-xl font-bold text-indigo-700">{formatRWF(closingBalances.bkBankRWF)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
              <FaMoneyBillWave className="text-green-600 text-2xl" />
                  <span className="text-lg font-bold text-green-700">Total Income</span>
            </div>
                <div className="text-3xl font-bold text-green-700">{formatRWF(totalIncomeRWF)}</div>
                <div className="text-sm text-gray-500 mt-1">Rwandan Francs</div>
          </div>
          
              <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
                  <FaCalculator className="text-red-600 text-2xl" />
                  <span className="text-lg font-bold text-red-700">Total Expenses</span>
            </div>
                <div className="text-3xl font-bold text-red-700">{formatRWF(totalExpenseRWF)}</div>
                <div className="text-sm text-gray-500 mt-1">Rwandan Francs</div>
          </div>
          
              <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
                  <FaPiggyBank className="text-blue-600 text-2xl" />
                  <span className="text-lg font-bold text-blue-700">Net Profit</span>
            </div>
                <div className="text-3xl font-bold text-blue-700">{formatRWF(totalIncomeRWF - totalExpenseRWF)}</div>
                <div className="text-sm text-gray-500 mt-1">Rwandan Francs</div>
          </div>
          
              <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-2 mb-2">
                  <FaChartPie className="text-purple-600 text-2xl" />
                  <span className="text-lg font-bold text-purple-700">Transactions</span>
            </div>
                <div className="text-3xl font-bold text-purple-700">{financialData.income.length + financialData.expenses.length}</div>
                <div className="text-sm text-gray-500 mt-1">Total entries</div>
          </div>
        </div>

            {/* Comprehensive Financial Summary */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Financial Summary - All Accounts (RWF)
            </h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">MTN Momo (RWF)</div>
                  <div className="text-xl font-bold text-orange-700">{formatRWF(openingBalances.mtnMomoRWF)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Equity Bank (RWF)</div>
                  <div className="text-xl font-bold text-purple-700">{formatRWF(openingBalances.equityBankRWF)}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">BK Bank (RWF)</div>
                  <div className="text-xl font-bold text-indigo-700">{formatRWF(openingBalances.bkBankRWF)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Income (RWF)</div>
                  <div className="text-xl font-bold text-emerald-700">{formatRWF(totalIncomeRWF)}</div>
              </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Expenses (RWF)</div>
                  <div className="text-xl font-bold text-red-700">{formatRWF(totalExpenseRWF)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Net MTN Momo (RWF)</div>
                  <div className="text-xl font-bold text-indigo-700">{formatRWF(closingBalances.mtnMomoRWF)}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Net Equity Bank (RWF)</div>
                  <div className="text-xl font-bold text-indigo-700">{formatRWF(closingBalances.equityBankRWF)}</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Net BK Bank (RWF)</div>
                  <div className="text-xl font-bold text-indigo-700">{formatRWF(closingBalances.bkBankRWF)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaFileAlt className="text-blue-600" />
                  Export Reports
            </h3>
                <div className="space-y-3">
                  <button 
                    onClick={exportToExcel}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaDownload />
                    Export to Excel
                  </button>
              </div>
              </div>



              <div className="bg-white rounded-2xl p-6 shadow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaEye className="text-purple-600" />
                  View Options
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowViewIncomeModal(true)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <FaEye />
                    View Income
                  </button>
                  <button 
                    onClick={() => setShowViewExpensesModal(true)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FaEye />
                    View Expenses
                  </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-blue-600 text-2xl" />
                  <span className="text-lg font-bold text-blue-700">Total Employees</span>
                </div>
                <div className="text-3xl font-bold text-blue-700">{payrollData.employees.length}</div>
                <div className="text-sm text-gray-500 mt-1">Active staff members</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="text-green-600 text-2xl" />
                  <span className="text-lg font-bold text-green-700">Monthly Payroll</span>
                </div>
                <div className="text-3xl font-bold text-green-700">{formatRWF(payrollData.employees.reduce((sum, emp) => sum + emp.netSalary, 0))}</div>
                <div className="text-sm text-gray-500 mt-1">Total net salary</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-purple-600 text-2xl" />
                  <span className="text-lg font-bold text-purple-700">Active Employees</span>
                </div>
                <div className="text-3xl font-bold text-purple-700">{payrollData.employees.filter(emp => emp.status === 'active').length}</div>
                <div className="text-sm text-gray-500 mt-1">Currently employed</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-orange-600 text-2xl" />
                  <span className="text-lg font-bold text-orange-700">Payroll Period</span>
                </div>
                <div className="text-3xl font-bold text-orange-700">Monthly</div>
                <div className="text-sm text-gray-500 mt-1">Salary payment cycle</div>
              </div>
            </div>

            {/* Employee Management */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  Employee Management
          </h3>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  Add Employee
                </button>
              </div>
              
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b">
                      <th className="py-3 px-4">Employee ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4">Monthly Salary</th>
                  <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                    {payrollData.employees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => viewEmployeeDetails(employee)}>
                        <td className="py-3 px-4 font-medium">{employee.employeeId}</td>
                        <td className="py-3 px-4">{employee.name}</td>
                    <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {employee.position}
                          </span>
                    </td>
                        <td className="py-3 px-4 font-bold text-green-600">{formatRWF(employee.salary)}</td>
                    <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {employee.status}
                      </span>
                    </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewEmployeeDetails(employee);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEmployee(employee.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete Employee"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

            {/* Payroll History */}
            <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaFileAlt className="text-purple-600" />
                  Payroll History
                </h3>
                <button
                  onClick={() => setShowPayrollModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaMoneyBillWave />
                  Process Payroll
              </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b">
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Total Monthly Payroll</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.payrollHistory.map((payroll) => (
                      <tr key={payroll.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => viewPayrollDetails(payroll)}>
                        <td className="py-3 px-4 font-medium">{payroll.month}</td>
                        <td className="py-3 px-4 font-bold text-green-600">{formatRWF(payroll.netPayroll)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payroll.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payroll.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{payroll.paymentDate}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewPayrollDetails(payroll);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'add')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add {modalType === 'income' ? 'Income' : 'Expense'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addTransaction(modalType as 'income' | 'expense', {
                description: formData.get('description'),
                cashRWF: parseFloat(formData.get('cashRWF') as string) || 0,
                bankRWF: parseFloat(formData.get('bankRWF') as string) || 0,
                category: formData.get('category') || 'OTHER',
                date: formData.get('date') || new Date().toISOString().split('T')[0]
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MTN Momo RWF</label>
                    <input
                      type="number"
                      name="mtnMomoRWF"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Equity Bank RWF</label>
                    <input
                      type="number"
                      name="equityBankRWF"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BK Bank RWF</label>
                    <input
                      type="number"
                      name="bkBankRWF"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {modalType === 'expense' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="FUEL">FUEL</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="CARWASH">CARWASH</option>
                      <option value="VEHICLE REPAIRS">VEHICLE REPAIRS</option>
                      <option value="INSURANCE">INSURANCE</option>
                      <option value="LICENSING & PERMITS">LICENSING & PERMITS</option>
                      <option value="PAYROLL">PAYROLL</option>
                      <option value="HOTEL ACCOMMODATION">HOTEL ACCOMMODATION</option>
                      <option value="OFFICE EXPENSES">OFFICE EXPENSES</option>
                      <option value="PETTY CASH">PETTY CASH</option>
                      <option value="UTILITIES">UTILITIES</option>
                      <option value="RENT & LEASE">RENT & LEASE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add {modalType === 'income' ? 'Income' : 'Expense'}
              </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
              </button>
            </div>
          </div>
            </form>
          </div>
        </div>
      )}

      {/* View Income Modal */}
      {showViewIncomeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'viewIncome')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaChartLine className="text-green-600" />
                Income Transactions
              </h3>
              <button
                onClick={() => setShowViewIncomeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimesCircle size={24} />
              </button>
              </div>
            <div className="flex-1 overflow-y-auto">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">MTN Momo RWF</div>
                    <div className="text-xl font-bold text-green-700">{formatRWF(filteredIncome.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0))}</div>
              </div>
                  <div>
                    <div className="text-sm text-gray-600">Equity Bank RWF</div>
                    <div className="text-xl font-bold text-green-700">{formatRWF(filteredIncome.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0))}</div>
              </div>
                  <div>
                    <div className="text-sm text-gray-600">BK Bank RWF</div>
                    <div className="text-xl font-bold text-green-700">{formatRWF(filteredIncome.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0))}</div>
              </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Total Income</div>
                    <div className="text-2xl font-bold text-green-700">
                      {formatRWF(filteredIncome.reduce((sum, item) => sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0), 0))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">MTN Momo RWF</th>
                      <th className="py-3 px-4">Equity Bank RWF</th>
                      <th className="py-3 px-4">BK Bank RWF</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncome.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => viewTransactionDetails(item, 'income')}>
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4 font-medium">{item.description}</td>
                        <td className="py-3 px-4">{item.mtnMomoRWF > 0 ? formatRWF(item.mtnMomoRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.equityBankRWF > 0 ? formatRWF(item.equityBankRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.bkBankRWF > 0 ? formatRWF(item.bkBankRWF) : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewTransactionDetails(item, 'income');
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTransaction('income', item.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Expenses Modal */}
      {showViewExpensesModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'viewExpenses')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaCalculator className="text-red-600" />
                Expense Transactions
              </h3>
              <button
                onClick={() => setShowViewExpensesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">MTN Momo RWF</div>
                    <div className="text-xl font-bold text-red-700">{formatRWF(filteredExpenses.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Equity Bank RWF</div>
                    <div className="text-xl font-bold text-red-700">{formatRWF(filteredExpenses.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">BK Bank RWF</div>
                    <div className="text-xl font-bold text-red-700">{formatRWF(filteredExpenses.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0))}</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-red-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-700">
                      {formatRWF(filteredExpenses.reduce((sum, item) => sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0), 0))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Cash RWF</th>
                      <th className="py-3 px-4">Equity Bank RWF</th>
                      <th className="py-3 px-4">BK Bank RWF</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4 font-medium">{item.description}</td>
                        <td className="py-3 px-4">{item.mtnMomoRWF > 0 ? formatRWF(item.mtnMomoRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.equityBankRWF > 0 ? formatRWF(item.equityBankRWF) : '-'}</td>
                        <td className="py-3 px-4">{item.bkBankRWF > 0 ? formatRWF(item.bkBankRWF) : '-'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {item.category}
                </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => deleteTransaction('expense', item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'transaction')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {selectedTransaction.type === 'income' ? (
                  <FaChartLine className="text-green-600" />
                ) : (
                  <FaCalculator className="text-red-600" />
                )}
                Transaction Details
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimesCircle size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Transaction Type Badge */}
              <div className="flex justify-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  selectedTransaction.type === 'income' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedTransaction.type === 'income' ? 'INCOME' : 'EXPENSE'}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
                  <div className="text-lg font-semibold text-gray-800">#{selectedTransaction.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                  <div className="text-lg font-semibold text-gray-800">{selectedTransaction.date}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                {editingMode['transaction'] ? (
                  <input
                    type="text"
                    defaultValue={selectedTransaction.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onBlur={(e) => saveTransactionChanges(selectedTransaction.id, selectedTransaction.type, { description: e.target.value })}
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-800">{selectedTransaction.description}</div>
                )}
              </div>

              {/* Category (for expenses) */}
              {selectedTransaction.type === 'expense' && selectedTransaction.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {selectedTransaction.category}
                  </div>
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Amount Breakdown</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">MTN Momo</label>
                    <div className={`text-lg font-bold ${selectedTransaction.mtnMomoRWF > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedTransaction.mtnMomoRWF > 0 ? formatRWF(selectedTransaction.mtnMomoRWF) : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Equity Bank</label>
                    <div className={`text-lg font-bold ${selectedTransaction.equityBankRWF > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedTransaction.equityBankRWF > 0 ? formatRWF(selectedTransaction.equityBankRWF) : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">BK Bank</label>
                    <div className={`text-lg font-bold ${selectedTransaction.bkBankRWF > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {selectedTransaction.bkBankRWF > 0 ? formatRWF(selectedTransaction.bkBankRWF) : '-'}
                    </div>
                  </div>
                </div>
                
                {/* Total Amount */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className={`text-2xl font-bold ${
                      selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatRWF((selectedTransaction.mtnMomoRWF || 0) + (selectedTransaction.equityBankRWF || 0) + (selectedTransaction.bkBankRWF || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {(selectedTransaction.createdBy || selectedTransaction.createdAt) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Transaction Metadata</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedTransaction.createdBy && (
                      <div>
                        <label className="block text-xs font-medium text-blue-600 mb-1">Created By</label>
                        <div className="text-blue-800">{selectedTransaction.createdBy}</div>
                      </div>
                    )}
                    {selectedTransaction.createdAt && (
                      <div>
                        <label className="block text-xs font-medium text-blue-600 mb-1">Created At</label>
                        <div className="text-blue-800">{new Date(selectedTransaction.createdAt).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => toggleEditMode('transaction')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    editingMode['transaction'] 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editingMode['transaction'] ? 'Save Changes' : 'Edit Transaction'}
                </button>
                <button
                  onClick={() => {
                    deleteTransaction(selectedTransaction.type, selectedTransaction.id);
                    setShowTransactionModal(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Transaction
                </button>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'employee')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaUsers className="text-blue-600" />
                Employee Details
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleModalMinimize('employee')}
                  className="text-gray-500 hover:text-gray-700"
                  title={minimizedModals['employee'] ? "Restore" : "Minimize"}
                >
                  {minimizedModals['employee'] ? <FaExpand size={20} /> : <FaCompress size={20} />}
                </button>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <FaTimesCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto space-y-6 transition-all duration-300 ${minimizedModals['employee'] ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              {/* Employee ID Badge */}
              <div className="flex justify-center">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {selectedEmployee.employeeId}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Employee Name</label>
                  {editingMode['employee'] ? (
                    <input
                      type="text"
                      defaultValue={selectedEmployee.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onBlur={(e) => saveEmployeeChanges(selectedEmployee.id, { name: e.target.value })}
                    />
                  ) : (
                    <div className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                  {editingMode['employee'] ? (
                    <select
                      defaultValue={selectedEmployee.position}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onBlur={(e) => saveEmployeeChanges(selectedEmployee.id, { position: e.target.value })}
                    >
                      <option value="Manager">Manager</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Sales & Marketing Agent">Sales & Marketing Agent</option>
                      <option value="Transport Officer">Transport Officer</option>
                      <option value="Driver">Driver</option>
                    </select>
                  ) : (
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {selectedEmployee.position}
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Join Date</label>
                  <div className="text-lg font-semibold text-gray-800">{selectedEmployee.joinDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedEmployee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedEmployee.status}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                    <div className="text-lg font-semibold text-gray-800">{selectedEmployee.phone}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bank Account</label>
                    <div className="text-lg font-semibold text-gray-800">{selectedEmployee.bankAccount}</div>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Salary Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Base Salary</label>
                    {editingMode['employee'] ? (
                      <input
                        type="number"
                        defaultValue={selectedEmployee.salary}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onBlur={(e) => {
                          const newSalary = parseInt(e.target.value) || 0;
                          saveEmployeeChanges(selectedEmployee.id, { 
                            salary: newSalary,
                            netSalary: newSalary + (selectedEmployee.allowances || 0) - (selectedEmployee.deductions || 0)
                          });
                        }}
                      />
                    ) : (
                      <div className="text-lg font-bold text-green-700">{formatRWF(selectedEmployee.salary)}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Allowances</label>
                    {editingMode['employee'] ? (
                      <input
                        type="number"
                        defaultValue={selectedEmployee.allowances}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onBlur={(e) => {
                          const newAllowances = parseInt(e.target.value) || 0;
                          saveEmployeeChanges(selectedEmployee.id, { 
                            allowances: newAllowances,
                            netSalary: (selectedEmployee.salary || 0) + newAllowances - (selectedEmployee.deductions || 0)
                          });
                        }}
                      />
                    ) : (
                      <div className="text-lg font-bold text-green-700">{formatRWF(selectedEmployee.allowances)}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Deductions</label>
                    {editingMode['employee'] ? (
                      <input
                        type="number"
                        defaultValue={selectedEmployee.deductions}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        onBlur={(e) => {
                          const newDeductions = parseInt(e.target.value) || 0;
                          saveEmployeeChanges(selectedEmployee.id, { 
                            deductions: newDeductions,
                            netSalary: (selectedEmployee.salary || 0) + (selectedEmployee.allowances || 0) - newDeductions
                          });
                        }}
                      />
                    ) : (
                      <div className="text-lg font-bold text-green-700">{formatRWF(selectedEmployee.deductions)}</div>
                    )}
                  </div>
                </div>
                
                {/* Net Salary */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">Net Salary</span>
                    <span className="text-2xl font-bold text-green-700">{formatRWF(selectedEmployee.netSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Employment Duration */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Employment Duration</h4>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Time with Company</div>
                  <div className="text-lg font-semibold text-blue-800">
                    {(() => {
                      const joinDate = new Date(selectedEmployee.joinDate);
                      const today = new Date();
                      const diffTime = Math.abs(today.getTime() - joinDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const months = Math.floor(diffDays / 30);
                      const years = Math.floor(months / 12);
                      
                      if (years > 0) {
                        return `${years} year${years > 1 ? 's' : ''} ${months % 12} month${months % 12 !== 1 ? 's' : ''}`;
                      } else if (months > 0) {
                        return `${months} month${months > 1 ? 's' : ''}`;
                      } else {
                        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => toggleEditMode('employee')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    editingMode['employee'] 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editingMode['employee'] ? 'Save Changes' : 'Edit Employee'}
                </button>
                <button
                  onClick={() => {
                    deleteEmployee(selectedEmployee.id);
                    setShowEmployeeModal(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Employee
                </button>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Details Modal */}
      {showPayrollModal && selectedPayroll && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'payroll')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Payroll Details
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleModalMinimize('payroll')}
                  className="text-gray-500 hover:text-gray-700"
                  title={minimizedModals['payroll'] ? "Restore" : "Minimize"}
                >
                  {minimizedModals['payroll'] ? <FaExpand size={20} /> : <FaCompress size={20} />}
                </button>
                <button
                  onClick={() => setShowPayrollModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close"
                >
                  <FaTimesCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className={`space-y-6 transition-all duration-300 ${minimizedModals['payroll'] ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
              {/* Payroll Period Badge */}
              <div className="flex justify-center">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {selectedPayroll.month}
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Payroll ID</label>
                  <div className="text-lg font-semibold text-gray-800">#{selectedPayroll.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedPayroll.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedPayroll.status}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Payment Date</label>
                  <div className="text-lg font-semibold text-gray-800">{selectedPayroll.paymentDate}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Processed By</label>
                  <div className="text-lg font-semibold text-gray-800">Accountant</div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Financial Breakdown</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Total Salary</label>
                    <div className="text-lg font-bold text-green-700">{formatRWF(selectedPayroll.totalSalary)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Allowances</label>
                    <div className="text-lg font-bold text-green-700">{formatRWF(selectedPayroll.totalAllowances)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-600 mb-1">Deductions</label>
                    <div className="text-lg font-bold text-green-700">{formatRWF(selectedPayroll.totalDeductions)}</div>
                  </div>
                </div>
                
                {/* Net Payroll */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">Net Payroll</span>
                    <span className="text-2xl font-bold text-green-700">{formatRWF(selectedPayroll.netPayroll)}</span>
                  </div>
                </div>
              </div>

              {/* Employee Breakdown */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Employee Breakdown</h4>
                <div className="space-y-3">
                  {payrollData.employees.map((employee) => (
                    <div key={employee.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{employee.name}</div>
                          <div className="text-sm text-gray-600">{employee.position}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{formatRWF(employee.salary)}</div>
                        <div className="text-xs text-gray-500">{employee.employeeId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Summary Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                    <div className="text-xl font-bold text-gray-800">{payrollData.employees.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatRWF(Math.round(selectedPayroll.totalSalary / payrollData.employees.length))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Here you could add print functionality in the future
                    console.log('Print payroll:', selectedPayroll.id);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Payroll
                </button>
                <button
                  onClick={() => {
                    // Here you could add export functionality in the future
                    console.log('Export payroll:', selectedPayroll.id);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export to Excel
                </button>
                <button
                  onClick={() => setShowPayrollModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={(e) => handleBackdropClick(e, 'addEmployee')}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              addEmployee({
                name: formData.get('name') as string,
                position: formData.get('position') as string,
                employeeId: formData.get('employeeId') as string,
                salary: parseFloat(formData.get('salary') as string) || 0,
                bankAccount: formData.get('bankAccount') as string,
                phone: formData.get('phone') as string
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input
                      type="text"
                      name="employeeId"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      name="position"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Sales & Marketing Agent">Sales & Marketing Agent</option>
                      <option value="Transport Officer">Transport Officer</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (RWF)</label>
                    <input
                      type="number"
                      name="salary"
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input
                    type="text"
                    name="bankAccount"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Process Monthly Payroll</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Monthly Payroll Summary</h4>
            <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Employees:</span>
                    <span className="font-semibold">{payrollData.employees.length}</span>
              </div>
                  <div className="flex justify-between">
                    <span>Total Monthly Salary:</span>
                    <span className="font-semibold">{formatRWF(payrollData.employees.reduce((sum, emp) => sum + emp.salary, 0))}</span>
              </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-green-600">
                      <span>Total Monthly Payroll:</span>
                      <span>{formatRWF(payrollData.employees.reduce((sum, emp) => sum + emp.salary, 0))}</span>
              </div>
              </div>
            </div>
          </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={processPayroll}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Process Payroll
                </button>
                <button
                  onClick={() => setShowPayrollModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
        </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 