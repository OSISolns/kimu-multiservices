import { sendEmail } from './email';
import { prisma } from '@/lib/prisma';

// Agent phone numbers - these should be stored in environment variables in production
const AGENT_PHONE_NUMBERS = [
  process.env.AGENT_PHONE_1 || '+250792958752',
  //process.env.AGENT_PHONE_2 || '+250789654321',
];

const AGENT_EMAILS = [
  'valery.osisolns@gmail.com',
];

// Admin emails for financial notifications
const ADMIN_EMAILS = [
  'admin@kimu.com',
  'finance@kimu.com',
];

interface BookingData {
  id: number;
  type: string;
  name?: string | null;
  guestName?: string | null;
  phone: string | null;
  carType?: string | null;
  roomType?: string | null;
  pickupDate?: string | null;
  pickupTime?: string | null;
  returnDate?: string | null;
  returnTime?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  guests?: string | null;
  nationality?: string | null;
  createdAt: string | Date;
}

// Financial notification interfaces
interface IncomeData {
  id: number;
  description: string;
  mtnMomoRWF: number;
  equityBankRWF: number;
  bkBankRWF: number;
  date: string;
  createdBy?: string;
}

interface ExpenseData {
  id: number;
  description: string;
  mtnMomoRWF: number;
  equityBankRWF: number;
  bkBankRWF: number;
  category: string;
  date: string;
  createdBy?: string;
}

interface EmployeeData {
  id: number;
  name: string;
  position: string;
  employeeId: string;
  salary: number;
  status: string;
  joinDate: string | Date;
  createdBy?: string;
}

interface PayrollData {
  id: number;
  employeeId: string;
  employeeName: string;
  salary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  year: string;
  processedBy?: string;
}

export async function sendBookingNotification(booking: BookingData) {
  try {
    const clientName = booking.name || booking.guestName || 'Unknown';
    const bookingType = booking.type;
    const bookingId = booking.id;
    const createdAt = new Date(booking.createdAt).toLocaleString('en-US', {
      timeZone: 'Africa/Kigali',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let subject = `New Booking Received: KIMU-${bookingId.toString().padStart(6, '0')}`;
    let text = `NEW BOOKING RECEIVED\n\n`;
    text += `Booking ID: KIMU-${bookingId.toString().padStart(6, '0')}\n`;
    text += `Client: ${clientName}\n`;
    text += `Phone: ${booking.phone}\n`;
    text += `Type: ${bookingType}\n`;
    text += `Received: ${createdAt}\n\n`;

    if (bookingType === 'Car Rental') {
      text += `Vehicle: ${booking.carType}\n`;
      text += `Pickup: ${booking.pickupDate} at ${booking.pickupTime}\n`;
      text += `Return: ${booking.returnDate} at ${booking.returnTime}\n`;
      text += `Nationality: ${booking.nationality}\n`;
    } else if (bookingType === 'Hotel') {
      text += `Room Type: ${booking.roomType}\n`;
      text += `Check-in: ${booking.checkInDate}\n`;
      text += `Check-out: ${booking.checkOutDate}\n`;
      text += `Guests: ${booking.guests}\n`;
    }

    text += `\nPlease check the dashboard for full details.\n`;
    text += `http://localhost:3001/staff/login`;

    // Fetch all relevant staff members
    const staffMembers = await prisma.user.findMany({
      where: {
        role: {
          in: ['agent', 'manager', 'accountant', 'transport-officer', 'admin']
        },
        status: 'active',
        email: {
          not: null
        }
      },
      select: {
        email: true
      }
    });

    const recipientEmails = staffMembers
      .map(user => user.email)
      .filter((email): email is string => !!email);

    if (recipientEmails.length === 0) {
      console.log('No staff members found to receive booking notification');
      return false;
    }

    // Send email to all relevant staff
    const emailPromises = recipientEmails.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Booking email notification sent to ${recipientEmails.length} staff members for booking ${bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending booking email notification:', error);
    return false;
  }
}

export async function sendBookingStatusUpdate(booking: BookingData, status: string) {
  try {
    const clientName = booking.name || booking.guestName || 'Unknown';
    const bookingId = booking.id;
    let subject = `Booking Status Update: KIMU-${bookingId.toString().padStart(6, '0')}`;
    let text = `BOOKING STATUS UPDATE\n\n`;
    text += `Booking ID: KIMU-${bookingId.toString().padStart(6, '0')}\n`;
    text += `Client: ${clientName}\n`;
    text += `New Status: ${status}\n`;
    text += `Updated: ${new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Kigali',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`;
    text += `Check the agent dashboard for details.\n`;
    text += `http://localhost:3001/agent/dashboard`;

    const emailPromises = AGENT_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Status update email sent to ${AGENT_EMAILS.length} agents for booking ${bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
}

export async function sendUrgentNotification(message: string) {
  try {
    let subject = 'URGENT AGENT NOTIFICATION';
    let text = `URGENT NOTIFICATION\n\n${message}\n\nCheck the agent dashboard immediately.\nhttp://localhost:3001/agent/dashboard`;
    const emailPromises = AGENT_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Urgent email notification sent to ${AGENT_EMAILS.length} agents`);
    return true;
  } catch (error) {
    console.error('Error sending urgent email notification:', error);
    return false;
  }
}

// Financial notification functions
export async function sendIncomeNotification(income: IncomeData) {
  try {
    const totalAmount = income.mtnMomoRWF + income.equityBankRWF + income.bkBankRWF;
    const formattedAmount = totalAmount.toLocaleString('en-US') + ' RWF';
    const date = new Date(income.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    let subject = `New Income Recorded: ${income.description}`;
    let text = `NEW INCOME RECORDED\n\n`;
    text += `Description: ${income.description}\n`;
    text += `Total Amount: ${formattedAmount}\n`;
    text += `Date: ${date}\n`;
    text += `Recorded by: ${income.createdBy || 'Accountant'}\n\n`;

    // Breakdown by payment method
    if (income.mtnMomoRWF > 0) {
      text += `MTN MoMo: ${income.mtnMomoRWF.toLocaleString('en-US')} RWF\n`;
    }
    if (income.equityBankRWF > 0) {
      text += `Equity Bank: ${income.equityBankRWF.toLocaleString('en-US')} RWF\n`;
    }
    if (income.bkBankRWF > 0) {
      text += `BK Bank: ${income.bkBankRWF.toLocaleString('en-US')} RWF\n`;
    }

    text += `\nCheck the accountant dashboard for full details.\n`;
    text += `http://localhost:3001/staff/accountant-dashboard`;

    // Send to admins and accountants
    const emailPromises = ADMIN_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Income notification sent to ${ADMIN_EMAILS.length} admins for income ${income.id}`);
    return true;
  } catch (error) {
    console.error('Error sending income notification:', error);
    return false;
  }
}

export async function sendExpenseNotification(expense: ExpenseData) {
  try {
    const totalAmount = expense.mtnMomoRWF + expense.equityBankRWF + expense.bkBankRWF;
    const formattedAmount = totalAmount.toLocaleString('en-US') + ' RWF';
    const date = new Date(expense.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    let subject = `New Expense Recorded: ${expense.description}`;
    let text = `NEW EXPENSE RECORDED\n\n`;
    text += `Description: ${expense.description}\n`;
    text += `Category: ${expense.category}\n`;
    text += `Total Amount: ${formattedAmount}\n`;
    text += `Date: ${date}\n`;
    text += `Recorded by: ${expense.createdBy || 'Accountant'}\n\n`;

    // Breakdown by payment method
    if (expense.mtnMomoRWF > 0) {
      text += `MTN MoMo: ${expense.mtnMomoRWF.toLocaleString('en-US')} RWF\n`;
    }
    if (expense.equityBankRWF > 0) {
      text += `Equity Bank: ${expense.equityBankRWF.toLocaleString('en-US')} RWF\n`;
    }
    if (expense.bkBankRWF > 0) {
      text += `BK Bank: ${expense.bkBankRWF.toLocaleString('en-US')} RWF\n`;
    }

    text += `\nCheck the accountant dashboard for full details.\n`;
    text += `http://localhost:3001/staff/accountant-dashboard`;

    // Send to admins and accountants
    const emailPromises = ADMIN_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Expense notification sent to ${ADMIN_EMAILS.length} admins for expense ${expense.id}`);
    return true;
  } catch (error) {
    console.error('Error sending expense notification:', error);
    return false;
  }
}

export async function sendEmployeeNotification(employee: EmployeeData, action: 'added' | 'updated' | 'deleted') {
  try {
    const actionText = action === 'added' ? 'NEW EMPLOYEE ADDED' :
      action === 'updated' ? 'EMPLOYEE UPDATED' : 'EMPLOYEE DELETED';
    const subjectText = action === 'added' ? 'New Employee Added' :
      action === 'updated' ? 'Employee Updated' : 'Employee Deleted';

    let subject = `${subjectText}: ${employee.name}`;
    let text = `${actionText}\n\n`;
    text += `Name: ${employee.name}\n`;
    text += `Position: ${employee.position}\n`;
    text += `Employee ID: ${employee.employeeId}\n`;
    text += `Salary: ${employee.salary.toLocaleString('en-US')} RWF\n`;
    text += `Status: ${employee.status}\n`;
    text += `Join Date: ${new Date(employee.joinDate).toLocaleDateString('en-US')}\n`;
    text += `Action by: ${employee.createdBy || 'Accountant'}\n\n`;

    text += `Check the accountant dashboard for full details.\n`;
    text += `http://localhost:3001/staff/accountant-dashboard`;

    // Send to admins and accountants
    const emailPromises = ADMIN_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Employee ${action} notification sent to ${ADMIN_EMAILS.length} admins for employee ${employee.name}`);
    return true;
  } catch (error) {
    console.error(`Error sending employee ${action} notification:`, error);
    return false;
  }
}

export async function sendPayrollNotification(payroll: PayrollData) {
  try {
    const formattedNetSalary = payroll.netSalary.toLocaleString('en-US') + ' RWF';
    const monthYear = `${payroll.month} ${payroll.year}`;

    let subject = `Payroll Processed: ${payroll.employeeName} - ${monthYear}`;
    let text = `PAYROLL PROCESSED\n\n`;
    text += `Employee: ${payroll.employeeName}\n`;
    text += `Employee ID: ${payroll.employeeId}\n`;
    text += `Period: ${monthYear}\n`;
    text += `Base Salary: ${payroll.salary.toLocaleString('en-US')} RWF\n`;
    text += `Allowances: ${payroll.allowances.toLocaleString('en-US')} RWF\n`;
    text += `Deductions: ${payroll.deductions.toLocaleString('en-US')} RWF\n`;
    text += `Net Salary: ${formattedNetSalary}\n`;
    text += `Processed by: ${payroll.processedBy || 'Accountant'}\n\n`;

    text += `Check the accountant dashboard for full details.\n`;
    text += `http://localhost:3001/staff/accountant-dashboard`;

    // Send to admins and accountants
    const emailPromises = ADMIN_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Payroll notification sent to ${ADMIN_EMAILS.length} admins for employee ${payroll.employeeName}`);
    return true;
  } catch (error) {
    console.error('Error sending payroll notification:', error);
    return false;
  }
}

export async function sendFinancialSummaryNotification(summary: {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  period: string;
  generatedBy?: string;
}) {
  try {
    const formattedIncome = summary.totalIncome.toLocaleString('en-US') + ' RWF';
    const formattedExpenses = summary.totalExpenses.toLocaleString('en-US') + ' RWF';
    const formattedProfit = summary.netProfit.toLocaleString('en-US') + ' RWF';

    let subject = `Financial Summary: ${summary.period}`;
    let text = `FINANCIAL SUMMARY\n\n`;
    text += `Period: ${summary.period}\n`;
    text += `Total Income: ${formattedIncome}\n`;
    text += `Total Expenses: ${formattedExpenses}\n`;
    text += `Net Profit: ${formattedProfit}\n`;
    text += `Generated by: ${summary.generatedBy || 'Accountant'}\n\n`;

    text += `Check the accountant dashboard for full details.\n`;
    text += `http://localhost:3001/staff/accountant-dashboard`;

    // Send to admins and accountants
    const emailPromises = ADMIN_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Financial summary notification sent to ${ADMIN_EMAILS.length} admins for period ${summary.period}`);
    return true;
  } catch (error) {
    console.error('Error sending financial summary notification:', error);
    return false;
  }
}