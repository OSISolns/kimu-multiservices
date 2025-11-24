import ExcelJS from 'exceljs';
import { EXCEL_COLORS, EXCEL_COLUMN_WIDTHS } from '@/constants/reports';
import { FinancialSummary, StaffPerformance, RecentBooking } from '@/types/reports';

export const formatRWF = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) return '0 RWF';
  return num.toLocaleString('en-US') + ' RWF';
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportRecentBookingsToExcel = (recentBookings: RecentBooking[]): void => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Recent Bookings');
  
  sheet.columns = [
    { header: 'ID', key: 'id', width: EXCEL_COLUMN_WIDTHS.small },
    { header: 'Type', key: 'type', width: 18 },
    { header: 'Name', key: 'name', width: EXCEL_COLUMN_WIDTHS.xlarge },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Date', key: 'date', width: 16 },
  ];
  
  recentBookings.forEach(b => {
    sheet.addRow({
      id: b.id,
      type: b.type,
      name: b.name,
      status: b.status,
      amount: b.amount,
      date: b.date,
    });
  });
  
  // Style header
  sheet.getRow(1).font = { bold: true, color: { argb: EXCEL_COLORS.white } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerBlue } };
  
  // Add totals/averages row with formulas
  const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : recentBookings.length + 2;
  sheet.getCell(`A${lastRow}`).value = 'Totals/Averages';
  sheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow-1})` };
  sheet.getCell(`F${lastRow}`).value = { formula: `COUNTA(F2:F${lastRow-1})` };
  sheet.getRow(lastRow).font = { bold: true };
  
  // Download
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `recent-bookings-${new Date().toISOString().split('T')[0]}.xlsx`);
  });
};

export const exportStaffToExcel = (filteredStaff: StaffPerformance[]): void => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Staff Performance');
  
  sheet.columns = [
    { header: 'Name', key: 'name', width: EXCEL_COLUMN_WIDTHS.large },
    { header: 'Role', key: 'role', width: EXCEL_COLUMN_WIDTHS.medium },
    { header: 'Bookings', key: 'bookings', width: 12 },
    { header: 'Revenue', key: 'revenue', width: EXCEL_COLUMN_WIDTHS.medium },
    { header: 'Completed', key: 'completed', width: 12 },
    { header: 'Pending', key: 'pending', width: EXCEL_COLUMN_WIDTHS.small },
    { header: 'Cancelled', key: 'cancelled', width: 12 },
    { header: 'Conversion', key: 'conversion', width: 12 },
    { header: 'Feedback', key: 'feedback', width: EXCEL_COLUMN_WIDTHS.small },
    { header: 'Reviews', key: 'reviews', width: EXCEL_COLUMN_WIDTHS.small },
  ];
  
  const getConversionRate = (s: StaffPerformance): number => {
    return s.leads ? Math.round((s.bookings / s.leads) * 100) : 0;
  };
  
  filteredStaff.forEach(s => {
    sheet.addRow({
      name: s.name,
      role: s.role,
      bookings: s.bookings,
      revenue: s.revenue,
      completed: s.completed,
      pending: s.pending,
      cancelled: s.cancelled,
      conversion: getConversionRate(s) + '%',
      feedback: s.feedback,
      reviews: s.reviews,
    });
  });
  
  // Style header
  sheet.getRow(1).font = { bold: true, color: { argb: EXCEL_COLORS.white } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerBlue } };
  
  // Add totals/averages row with formulas
  const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : filteredStaff.length + 2;
  sheet.getCell(`A${lastRow}`).value = 'Totals/Averages';
  sheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${lastRow-1})` };
  sheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow-1})` };
  sheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow-1})` };
  sheet.getCell(`F${lastRow}`).value = { formula: `SUM(F2:F${lastRow-1})` };
  sheet.getCell(`G${lastRow}`).value = { formula: `SUM(G2:G${lastRow-1})` };
  sheet.getCell(`H${lastRow}`).value = { formula: `AVERAGE(H2:H${lastRow-1})` };
  sheet.getCell(`I${lastRow}`).value = { formula: `AVERAGE(I2:I${lastRow-1})` };
  sheet.getCell(`J${lastRow}`).value = { formula: `AVERAGE(J2:J${lastRow-1})` };
  sheet.getRow(lastRow).font = { bold: true };
  
  // Download
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `staff-performance-${new Date().toISOString().split('T')[0]}.xlsx`);
  });
};

export const exportFinancialSummaryToExcel = (financialSummary: FinancialSummary, username?: string): void => {
  if (!financialSummary) return;
  
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Financial Summary');
  
  // Set column widths
  sheet.columns = [
    { key: 'A', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'B', width: EXCEL_COLUMN_WIDTHS.xlarge },
    { key: 'C', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'D', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'E', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'F', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'G', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'H', width: EXCEL_COLUMN_WIDTHS.medium },
    { key: 'I', width: EXCEL_COLUMN_WIDTHS.medium }
  ];
  
  // Add company header
  const headerRow = sheet.addRow(['KIMU FINANCIAL SUMMARY REPORT']);
  headerRow.font = { bold: true, size: 18, color: { argb: EXCEL_COLORS.white } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerDark } };
  sheet.mergeCells('A1:I1');
  headerRow.alignment = { horizontal: 'center' };
  
  // Add metadata
  sheet.addRow(['Generated by:', username || 'Admin', '', '', '', '', '', '', '']);
  sheet.addRow(['Generated at:', new Date().toLocaleString(), '', '', '', '', '', '', '']);
  sheet.addRow(['Period:', financialSummary?.period || 'N/A', '', '', '', '', '', '', '']);
  sheet.addRow(['']);
  
  // Add executive summary
  addExecutiveSummary(sheet, financialSummary);
  
  // Add account balances
  const balancesStartRow = addAccountBalances(sheet, financialSummary);
  
  // Add income transactions
  const incomeEndRow = addIncomeTransactions(sheet, financialSummary, balancesStartRow + 8);
  
  // Add expense transactions
  const expenseEndRow = addExpenseTransactions(sheet, financialSummary, incomeEndRow + 3);
  
  // Add final summary
  addFinalSummary(sheet, financialSummary, expenseEndRow + 3);
  
  // Add borders to all data cells
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });
  
  // Download
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `KIMU-Financial-Summary-${new Date().toISOString().split('T')[0]}.xlsx`);
  });
};

// Helper functions for financial summary sections
const addExecutiveSummary = (sheet: ExcelJS.Worksheet, financialSummary: FinancialSummary): void => {
  const summaryTitle = sheet.addRow(['EXECUTIVE SUMMARY']);
  summaryTitle.font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.white } };
  summaryTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerBlue } };
  sheet.mergeCells('A6:I6');
  summaryTitle.alignment = { horizontal: 'center' };
  
  const summaryData = [
    ['Total Income (RWF)', financialSummary?.totalIncome || 0, '', '', '', '', '', '', ''],
    ['Total Expenses (RWF)', financialSummary?.totalExpenses || 0, '', '', '', '', '', '', ''],
    ['Net Profit/Loss (RWF)', financialSummary?.netProfit || 0, '', '', '', '', '', '', ''],
    ['Transaction Count', financialSummary?.transactionCount || 0, '', '', '', '', '', '', ''],
    ['Average Income per Transaction', Math.round((financialSummary?.totalIncome || 0) / (financialSummary?.income?.length || 1)), '', '', '', '', '', '', ''],
    ['Average Expense per Transaction', Math.round((financialSummary?.totalExpenses || 0) / (financialSummary?.expenses?.length || 1)), '', '', '', '', '', '', ''],
    ['Profit Margin (%)', Math.round(((financialSummary?.netProfit || 0) / (financialSummary?.totalIncome || 1)) * 100), '', '', '', '', '', '', '']
  ];
  
  summaryData.forEach((row, index) => {
    const excelRow = sheet.addRow(row);
    excelRow.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.headerDark } };
    excelRow.getCell(2).font = { bold: true, color: { argb: Number(row[1]) >= 0 ? EXCEL_COLORS.successGreen : EXCEL_COLORS.dangerRed } };
    if (index === 2) { // Net Profit row
      excelRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: Number(row[1]) >= 0 ? EXCEL_COLORS.lightGreen : EXCEL_COLORS.lightRed } };
    }
  });
  
  sheet.addRow(['']);
};

const addAccountBalances = (sheet: ExcelJS.Worksheet, financialSummary: FinancialSummary): number => {
  const balancesTitle = sheet.addRow(['ACCOUNT BALANCES']);
  balancesTitle.font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.white } };
  balancesTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerPurple } };
  sheet.mergeCells('A15:I15');
  balancesTitle.alignment = { horizontal: 'center' };
  
  // Account balances header
  const balancesHeader = sheet.addRow(['Account', 'Opening Balance (RWF)', 'Closing Balance (RWF)', 'Net Change (RWF)', 'Change %', '', '', '', '']);
  balancesHeader.font = { bold: true, color: { argb: EXCEL_COLORS.white } };
  balancesHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerPurple } };
  
  const accounts = [
    { name: 'MTN Momo', opening: financialSummary?.openingBalances?.mtnMomoRWF || 0, closing: financialSummary?.closingBalances?.mtnMomoRWF || 0 },
    { name: 'Equity Bank', opening: financialSummary?.openingBalances?.equityBankRWF || 0, closing: financialSummary?.closingBalances?.equityBankRWF || 0 },
    { name: 'BK Bank', opening: financialSummary?.openingBalances?.bkBankRWF || 0, closing: financialSummary?.closingBalances?.bkBankRWF || 0 }
  ];
  
  accounts.forEach(account => {
    const netChange = account.closing - account.opening;
    const changePercent = account.opening > 0 ? Math.round((netChange / account.opening) * 100) : 0;
    const row = sheet.addRow([
      account.name,
      account.opening,
      account.closing,
      netChange,
      changePercent + '%',
      '', '', '', ''
    ]);
    
    row.getCell(4).font = { bold: true, color: { argb: netChange >= 0 ? EXCEL_COLORS.successGreen : EXCEL_COLORS.dangerRed } };
    row.getCell(5).font = { bold: true, color: { argb: changePercent >= 0 ? EXCEL_COLORS.successGreen : EXCEL_COLORS.dangerRed } };
  });
  
  return sheet.lastRow?.number || 0;
};

const addIncomeTransactions = (sheet: ExcelJS.Worksheet, financialSummary: FinancialSummary, startRow: number): number => {
  const incomeTitle = sheet.addRow(['INCOME TRANSACTIONS']);
  incomeTitle.font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.white } };
  incomeTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerGreen } };
  sheet.mergeCells(`A${startRow}:I${startRow}`);
  incomeTitle.alignment = { horizontal: 'center' };
  
  const incomeHeader = sheet.addRow(['ID', 'Description', 'Date', 'MTN Momo (RWF)', 'Equity Bank (RWF)', 'BK Bank (RWF)', 'Total (RWF)', '', '']);
  incomeHeader.font = { bold: true, color: { argb: EXCEL_COLORS.white } };
  incomeHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerGreen } };
  
  financialSummary?.income?.forEach((item) => {
    const total = (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0);
    sheet.addRow([
      item.id,
      item.description,
      item.date,
      item.mtnMomoRWF || 0,
      item.equityBankRWF || 0,
      item.bkBankRWF || 0,
      total,
      '', ''
    ]);
  });
  
  return sheet.lastRow?.number || 0;
};

const addExpenseTransactions = (sheet: ExcelJS.Worksheet, financialSummary: FinancialSummary, startRow: number): number => {
  const expenseTitle = sheet.addRow(['EXPENSE TRANSACTIONS']);
  expenseTitle.font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.white } };
  expenseTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerRed } };
  sheet.mergeCells(`A${startRow}:I${startRow}`);
  expenseTitle.alignment = { horizontal: 'center' };
  
  const expenseHeader = sheet.addRow(['ID', 'Description', 'Category', 'Date', 'MTN Momo (RWF)', 'Equity Bank (RWF)', 'BK Bank (RWF)', 'Total (RWF)', '']);
  expenseHeader.font = { bold: true, color: { argb: EXCEL_COLORS.white } };
  expenseHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerRed } };
  
  financialSummary?.expenses?.forEach((item) => {
    const total = (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0);
    sheet.addRow([
      item.id,
      item.description,
      item.category,
      item.date,
      item.mtnMomoRWF || 0,
      item.equityBankRWF || 0,
      item.bkBankRWF || 0,
      total,
      ''
    ]);
  });
  
  return sheet.lastRow?.number || 0;
};

const addFinalSummary = (sheet: ExcelJS.Worksheet, financialSummary: FinancialSummary, startRow: number): void => {
  const finalTitle = sheet.addRow(['FINAL SUMMARY']);
  finalTitle.font = { bold: true, size: 16, color: { argb: EXCEL_COLORS.white } };
  finalTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.headerDark } };
  sheet.mergeCells(`A${startRow}:I${startRow}`);
  finalTitle.alignment = { horizontal: 'center' };
  
  const finalSummary = [
    ['Total Income', financialSummary?.totalIncome || 0, '', '', '', '', '', '', ''],
    ['Total Expenses', financialSummary?.totalExpenses || 0, '', '', '', '', '', '', ''],
    ['Net Profit/Loss', financialSummary?.netProfit || 0, '', '', '', '', '', '', ''],
    ['Profit Margin', Math.round(((financialSummary?.netProfit || 0) / (financialSummary?.totalIncome || 1)) * 100) + '%', '', '', '', '', '', '', ''],
    ['Total Transactions', financialSummary?.transactionCount || 0, '', '', '', '', '', '', ''],
    ['Average Transaction Value', Math.round(((financialSummary?.totalIncome || 0) + (financialSummary?.totalExpenses || 0)) / (financialSummary?.transactionCount || 1)), '', '', '', '', '', '', '', '']
  ];
  
  finalSummary.forEach((row, index) => {
    const excelRow = sheet.addRow(row);
    excelRow.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.headerDark } };
    excelRow.getCell(2).font = { bold: true, color: { argb: index === 2 ? (Number(row[1]) >= 0 ? EXCEL_COLORS.successGreen : EXCEL_COLORS.dangerRed) : EXCEL_COLORS.headerDark } };
    if (index === 2) { // Net Profit row
      excelRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: Number(row[1]) >= 0 ? EXCEL_COLORS.lightGreen : EXCEL_COLORS.lightRed } };
    }
  });
};

