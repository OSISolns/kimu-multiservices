import { prisma } from '@/lib/prisma'
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from './activityLog'
import {
  sendIncomeNotification,
  sendExpenseNotification,
  sendEmployeeNotification,
  sendPayrollNotification,
  sendFinancialSummaryNotification
} from './notifications'

// Financial notification functions
export async function createIncomeNotification(incomeData: any, createdBy: string) {
  try {
    const message = `New income recorded: ${incomeData.description} - ${(incomeData.mtnMomoRWF + incomeData.equityBankRWF + incomeData.bkBankRWF).toLocaleString('en-US')} RWF`

    const notification = await prisma.notification.create({
      data: {
        message,
        type: 'income',
        read: false,
        userId: null // System notification
      }
    })

    // Send email notification
    await sendIncomeNotification({
      ...incomeData,
      createdBy
    })

    // Log activity
    await logActivity({
      action: ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: notification.id,
        type: 'income',
        message,
        incomeData,
        createdBy
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating income notification:', error)
    throw error
  }
}

export async function createExpenseNotification(expenseData: any, createdBy: string) {
  try {
    const message = `New expense recorded: ${expenseData.description} - ${(expenseData.mtnMomoRWF + expenseData.equityBankRWF + expenseData.bkBankRWF).toLocaleString('en-US')} RWF`

    const notification = await prisma.notification.create({
      data: {
        message,
        type: 'expense',
        read: false,
        userId: null // System notification
      }
    })

    // Send email notification
    await sendExpenseNotification({
      ...expenseData,
      createdBy
    })

    // Log activity
    await logActivity({
      action: ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: notification.id,
        type: 'expense',
        message,
        expenseData,
        createdBy
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating expense notification:', error)
    throw error
  }
}

export async function createEmployeeNotification(employeeData: any, action: 'added' | 'updated' | 'deleted', createdBy: string) {
  try {
    const message = `Employee ${action}: ${employeeData.name} - ${employeeData.position}`

    const notification = await prisma.notification.create({
      data: {
        message,
        type: 'employee',
        read: false,
        userId: null // System notification
      }
    })

    // Send email notification
    await sendEmployeeNotification({
      ...employeeData,
      createdBy
    }, action)

    // Log activity
    await logActivity({
      action: ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: notification.id,
        type: 'employee',
        message,
        employeeData,
        action,
        createdBy
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating employee notification:', error)
    throw error
  }
}

export async function createPayrollNotification(payrollData: any, processedBy: string) {
  try {
    const message = `Payroll processed for ${payrollData.employeeName} - ${payrollData.amount.toLocaleString('en-US')} RWF`

    const notification = await prisma.notification.create({
      data: {
        message,
        type: 'payroll',
        read: false,
        userId: null // System notification
      }
    })

    // Send email notification
    await sendPayrollNotification({
      ...payrollData,
      processedBy
    })

    // Log activity
    await logActivity({
      action: ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: notification.id,
        type: 'payroll',
        message,
        payrollData,
        processedBy
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating payroll notification:', error)
    throw error
  }
}

export async function createFinancialSummaryNotification(summaryData: any, generatedBy: string) {
  try {
    const message = `Financial summary generated for ${summaryData.period} - Total Income: ${summaryData.totalIncome.toLocaleString('en-US')} RWF, Net Profit: ${summaryData.netProfit.toLocaleString('en-US')} RWF`

    const notification = await prisma.notification.create({
      data: {
        message,
        type: 'financial_summary',
        read: false,
        userId: null // System notification
      }
    })

    // Send email notification
    await sendFinancialSummaryNotification({
      ...summaryData,
      generatedBy
    })

    // Log activity
    await logActivity({
      action: ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: notification.id,
        type: 'financial_summary',
        message,
        summaryData,
        generatedBy
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating financial summary notification:', error)
    throw error
  }
}