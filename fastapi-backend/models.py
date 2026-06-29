"""
KIMU Transport & Multiservices — SQLModel Table Definitions
Mirrors all 20+ models from prisma/schema.prisma exactly.
Uses Turso (libSQL / SQLite-compatible) as the backing store.
"""

from sqlmodel import SQLModel, Field
from typing import Optional, Any
from datetime import datetime


# ─── Core Models ─────────────────────────────────────────────────────────────

class User(SQLModel, table=True):
    __tablename__ = "User"
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    passwordHash: str
    role: str = "agent"
    department: Optional[str] = None
    status: str = "active"
    profilePicture: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    lastLogin: Optional[datetime] = None
    emailNotifications: bool = False
    whatsappNotifications: bool = False
    theme: Optional[str] = "system"
    language: Optional[str] = "en"
    timezone: Optional[str] = "Africa/Kigali"
    profileVisibility: Optional[str] = "team"
    showEmail: bool = False
    showPhone: bool = False


class Vehicle(SQLModel, table=True):
    __tablename__ = "Vehicle"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    image: str
    type: str
    category: str
    price: str
    year: int
    engine: str
    mileage: str
    transmission: str
    fuel: str
    capacity: str
    doors: int
    description: str
    isAvailable: bool = True
    power: str
    fuelEfficiency: str
    quantity: int = 1
    status: str = "available"
    maintenanceNotes: Optional[str] = None
    maintenanceDate: Optional[datetime] = None
    quantityUpdateReason: Optional[str] = None
    quantityUpdateDate: Optional[datetime] = None
    licensePlate: Optional[str] = None
    vehicleId: Optional[str] = None


class Booking(SQLModel, table=True):
    __tablename__ = "Booking"
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    nationality: Optional[str] = None
    idOrPassport: Optional[str] = None
    carType: Optional[str] = None
    pickupDate: Optional[str] = None
    pickupTime: Optional[str] = None
    returnDate: Optional[str] = None
    returnTime: Optional[str] = None
    rentalDays: Optional[int] = None
    returnConfirmed: bool = False
    fullTank: bool = False
    pickupLocation: Optional[str] = None
    dropoffLocation: Optional[str] = None
    flightNumber: Optional[str] = None
    notes: Optional[str] = None
    status: str = "Active"
    vehicle: Optional[str] = None
    driver: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class Notification(SQLModel, table=True):
    __tablename__ = "Notification"
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: Optional[int] = None
    message: str
    type: str
    read: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class ActivityLog(SQLModel, table=True):
    __tablename__ = "ActivityLog"
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: Optional[int] = None
    action: str
    details: Optional[str] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class SystemLog(SQLModel, table=True):
    __tablename__ = "SystemLog"
    id: Optional[int] = Field(default=None, primary_key=True)
    action: str
    details: Optional[str] = None
    createdBy: Optional[int] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class Payment(SQLModel, table=True):
    __tablename__ = "Payment"
    id: Optional[int] = Field(default=None, primary_key=True)
    bookingId: int
    bookingType: str
    amount: float
    currency: str = "RWF"
    paymentMethod: str
    status: str
    transactionId: Optional[str] = None
    paymentDate: datetime = Field(default_factory=datetime.utcnow)
    userId: Optional[int] = None


# ─── CRM Models ──────────────────────────────────────────────────────────────

class Lead(SQLModel, table=True):
    __tablename__ = "Lead"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    company: str
    stage: str = "Contacted"
    value: float = 0.0
    contact: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    lastContact: datetime = Field(default_factory=datetime.utcnow)
    nextFollowUp: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Campaign(SQLModel, table=True):
    __tablename__ = "Campaign"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: Optional[str] = "general"
    reach: int = 0
    engagement: int = 0
    leads: int = 0
    conversions: int = 0
    budget: float = 0.0
    startDate: datetime = Field(default_factory=datetime.utcnow)
    endDate: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Activity(SQLModel, table=True):
    __tablename__ = "Activity"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(default_factory=datetime.utcnow)
    client: str
    activity: str
    outcome: str
    type: str = "call"
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class Quote(SQLModel, table=True):
    __tablename__ = "Quote"
    id: Optional[int] = Field(default=None, primary_key=True)
    customerId: int
    serviceType: str
    amount: float
    currency: str = "RWF"
    validUntil: datetime = Field(default_factory=datetime.utcnow)
    status: str = "draft"
    notes: Optional[str] = None
    createdBy: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Accounting Models ────────────────────────────────────────────────────────

class Income(SQLModel, table=True):
    __tablename__ = "Income"
    id: Optional[int] = Field(default=None, primary_key=True)
    description: str
    amount: float
    category: str
    paymentMethod: str
    date: datetime
    reference: Optional[str] = None
    notes: Optional[str] = None
    clientName: Optional[str] = None
    clientPhone: Optional[str] = None
    isRefund: Optional[bool] = False
    originalIncomeId: Optional[int] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Expense(SQLModel, table=True):
    __tablename__ = "Expense"
    id: Optional[int] = Field(default=None, primary_key=True)
    description: str
    amount: float
    category: str
    paymentMethod: str
    date: datetime
    receiptNumber: Optional[str] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Invoice(SQLModel, table=True):
    __tablename__ = "Invoice"
    id: Optional[int] = Field(default=None, primary_key=True)
    invoiceNumber: str = Field(unique=True)
    clientName: str
    clientEmail: str
    clientPhone: Optional[str] = None
    amount: float
    taxRate: float = 18.0
    taxAmount: float
    totalAmount: float
    grandTotal: float
    dueDate: datetime
    description: str
    items: str  # JSON string
    status: str = "pending"
    emailSent: bool = False
    emailSentAt: Optional[datetime] = None
    emailSubject: Optional[str] = None
    emailMessage: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Budget(SQLModel, table=True):
    __tablename__ = "Budget"
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str
    amount: float
    period: str
    year: int
    month: Optional[int] = None
    quarter: Optional[int] = None
    description: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class PettyCashTransaction(SQLModel, table=True):
    __tablename__ = "PettyCashTransaction"
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(default_factory=datetime.utcnow)
    description: str
    amount: float
    type: str
    category: Optional[str] = None
    receiptUrl: Optional[str] = None
    requestedBy: Optional[str] = None
    approvedBy: Optional[str] = None
    status: str = "pending"
    balanceAfter: Optional[float] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


# ─── HR / Payroll Models ─────────────────────────────────────────────────────

class Employee(SQLModel, table=True):
    __tablename__ = "Employee"
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: Optional[int] = Field(default=None, unique=True)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    employeeId: str = Field(unique=True)
    position: str
    department: str
    employmentType: str
    hireDate: datetime
    salary: float
    bankAccount: Optional[str] = None
    bankName: Optional[str] = None
    taxId: Optional[str] = None
    socialSecurityId: Optional[str] = None
    status: str = "active"
    terminationDate: Optional[datetime] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class SalaryStructure(SQLModel, table=True):
    __tablename__ = "SalaryStructure"
    id: Optional[int] = Field(default=None, primary_key=True)
    employeeId: int
    baseSalary: float
    allowances: str  # JSON string
    deductions: str  # JSON string
    effectiveDate: datetime
    endDate: Optional[datetime] = None
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Payroll(SQLModel, table=True):
    __tablename__ = "Payroll"
    id: Optional[int] = Field(default=None, primary_key=True)
    employeeId: int
    period: str
    year: int
    month: int
    status: str = "draft"
    grossSalary: float
    netSalary: float
    totalAllowances: float = 0.0
    totalDeductions: float = 0.0
    workingDays: int
    actualDays: int
    overtimeHours: float = 0.0
    overtimePay: float = 0.0
    bonus: float = 0.0
    advance: float = 0.0
    loanDeduction: float = 0.0
    taxDeduction: float = 0.0
    socialSecurity: float = 0.0
    otherDeductions: float = 0.0
    paymentMethod: Optional[str] = None
    paymentDate: Optional[datetime] = None
    processedBy: Optional[int] = None
    processedAt: Optional[datetime] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class PayrollItem(SQLModel, table=True):
    __tablename__ = "PayrollItem"
    id: Optional[int] = Field(default=None, primary_key=True)
    payrollId: int
    employeeId: int
    type: str
    name: str
    amount: float
    percentage: Optional[float] = None
    description: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Sales / Marketplace Models ───────────────────────────────────────────────

class SavedItem(SQLModel, table=True):
    __tablename__ = "SavedItem"
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int
    itemType: str
    itemId: int
    itemData: Optional[str] = None  # JSON string
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class CarListing(SQLModel, table=True):
    __tablename__ = "CarListing"
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int
    make: str
    model: str
    year: int
    price: float
    mileage: int
    condition: str
    transmission: str
    fuelType: str
    color: str
    description: Optional[str] = None
    images: str  # JSON string
    status: str = "pending"
    contactPhone: str
    location: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Finance Contracts ────────────────────────────────────────────────────────

class FinanceContract(SQLModel, table=True):
    __tablename__ = "FinanceContract"
    id: str = Field(primary_key=True)
    vehicleId: int
    clientName: str
    clientPhone: str
    clientEmail: Optional[str] = None
    totalPrice: float
    downPayment: float
    amountPaid: float = 0.0
    dailyRate: float
    termMonths: int
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    maturityDate: Optional[datetime] = None
    status: str = "PENDING"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class FinancePayment(SQLModel, table=True):
    __tablename__ = "FinancePayment"
    id: str = Field(primary_key=True)
    contractId: str
    amount: float
    paymentDate: datetime = Field(default_factory=datetime.utcnow)
    recordedBy: Optional[int] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class ClientCredit(SQLModel, table=True):
    __tablename__ = "ClientCredit"
    id: Optional[int] = Field(default=None, primary_key=True)
    clientName: str
    whatsappNumber: str
    totalCredit: float
    paidAmount: float = 0.0
    dailyPayment: float
    nextPaymentDate: str
    status: str = "active"
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


# ─── Analytics / Reporting Models ────────────────────────────────────────────

class ReportTemplate(SQLModel, table=True):
    __tablename__ = "ReportTemplate"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    category: str
    query: str  # JSON string
    parameters: Optional[str] = None  # JSON string
    isActive: bool = True
    createdBy: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class Report(SQLModel, table=True):
    __tablename__ = "Report"
    id: Optional[int] = Field(default=None, primary_key=True)
    templateId: Optional[int] = None
    name: str
    description: Optional[str] = None
    category: str
    type: str
    status: str = "pending"
    parameters: Optional[str] = None  # JSON string
    filters: Optional[str] = None     # JSON string
    data: Optional[str] = None        # JSON string
    filePath: Optional[str] = None
    fileFormat: Optional[str] = None
    generatedBy: int
    generatedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    expiresAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
