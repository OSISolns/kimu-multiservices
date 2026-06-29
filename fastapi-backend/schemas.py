"""
Pydantic request/response schemas for all KIMU API routes.
"""

from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str
    newPassword: str

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


# ─── Users ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    role: str = "agent"
    department: Optional[str] = None
    status: str = "active"

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None
    emailNotifications: Optional[bool] = None
    whatsappNotifications: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    profileVisibility: Optional[str] = None
    showEmail: Optional[bool] = None
    showPhone: Optional[bool] = None


# ─── Vehicles ────────────────────────────────────────────────────────────────

class VehicleCreate(BaseModel):
    name: str
    image: str = ""
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
    licensePlate: Optional[str] = None
    vehicleId: Optional[str] = None

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = None
    year: Optional[int] = None
    engine: Optional[str] = None
    mileage: Optional[str] = None
    transmission: Optional[str] = None
    fuel: Optional[str] = None
    capacity: Optional[str] = None
    doors: Optional[int] = None
    description: Optional[str] = None
    isAvailable: Optional[bool] = None
    power: Optional[str] = None
    fuelEfficiency: Optional[str] = None
    quantity: Optional[int] = None
    status: Optional[str] = None
    maintenanceNotes: Optional[str] = None
    maintenanceDate: Optional[datetime] = None
    quantityUpdateReason: Optional[str] = None
    licensePlate: Optional[str] = None
    vehicleId: Optional[str] = None


# ─── Bookings ────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
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
    pickupLocation: Optional[str] = None
    dropoffLocation: Optional[str] = None
    flightNumber: Optional[str] = None
    notes: Optional[str] = None

class BookingUpdate(BaseModel):
    vehicle: Optional[str] = None
    driver: Optional[str] = None
    status: Optional[str] = None
    returnConfirmed: Optional[bool] = None
    fullTank: Optional[bool] = None
    notes: Optional[str] = None
    pickupDate: Optional[str] = None
    returnDate: Optional[str] = None


# ─── Payments ────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    bookingId: int
    bookingType: str
    amount: float
    currency: str = "RWF"
    paymentMethod: str
    status: str = "pending"
    transactionId: Optional[str] = None

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    transactionId: Optional[str] = None
    amount: Optional[float] = None


# ─── Notifications ────────────────────────────────────────────────────────────

class NotificationCreate(BaseModel):
    userId: Optional[int] = None
    message: str
    type: str


# ─── Leads / CRM ─────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    name: str
    company: str
    stage: str = "Contacted"
    value: float = 0.0
    contact: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    nextFollowUp: Optional[datetime] = None

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    stage: Optional[str] = None
    value: Optional[float] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    nextFollowUp: Optional[datetime] = None

class QuoteCreate(BaseModel):
    customerId: int
    serviceType: str
    amount: float
    currency: str = "RWF"
    validUntil: datetime
    status: str = "draft"
    notes: Optional[str] = None

class QuoteUpdate(BaseModel):
    serviceType: Optional[str] = None
    amount: Optional[float] = None
    validUntil: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CampaignCreate(BaseModel):
    name: str
    type: Optional[str] = "general"
    reach: int = 0
    engagement: int = 0
    leads: int = 0
    conversions: int = 0
    budget: float = 0.0
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None

class ActivityCreate(BaseModel):
    client: str
    activity: str
    outcome: str
    type: str = "call"
    date: Optional[datetime] = None


# ─── Accounting ──────────────────────────────────────────────────────────────

class IncomeCreate(BaseModel):
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

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str
    paymentMethod: str
    date: datetime
    receiptNumber: Optional[str] = None
    notes: Optional[str] = None

class InvoiceCreate(BaseModel):
    clientName: str
    clientEmail: str
    clientPhone: Optional[str] = None
    amount: float
    taxRate: float = 18.0
    dueDate: datetime
    description: str
    items: List[Any]
    status: str = "pending"

class BudgetCreate(BaseModel):
    category: str
    amount: float
    period: str
    year: int
    month: Optional[int] = None
    quarter: Optional[int] = None
    description: Optional[str] = None

class PettyCashCreate(BaseModel):
    description: str
    amount: float
    type: str
    category: Optional[str] = None
    receiptUrl: Optional[str] = None
    requestedBy: Optional[str] = None


# ─── Payroll ─────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    userId: Optional[int] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    employeeId: str
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
    notes: Optional[str] = None

class EmployeeUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    employmentType: Optional[str] = None
    salary: Optional[float] = None
    bankAccount: Optional[str] = None
    bankName: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class PayrollCreate(BaseModel):
    employeeId: int
    period: str
    year: int
    month: int
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
    notes: Optional[str] = None


# ─── Client Credits ───────────────────────────────────────────────────────────

class ClientCreditCreate(BaseModel):
    clientName: str
    whatsappNumber: str
    totalCredit: float
    dailyPayment: float
    nextPaymentDate: str
    notes: Optional[str] = None

class ClientCreditUpdate(BaseModel):
    clientName: Optional[str] = None
    whatsappNumber: Optional[str] = None
    totalCredit: Optional[float] = None
    dailyPayment: Optional[float] = None
    nextPaymentDate: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CreditPaymentRequest(BaseModel):
    amount: float


# ─── Finance Contracts ────────────────────────────────────────────────────────

class FinanceContractCreate(BaseModel):
    vehicleId: int
    clientName: str
    clientPhone: str
    clientEmail: Optional[str] = None
    totalPrice: float
    downPayment: float
    dailyRate: float
    termMonths: int
    startDate: Optional[datetime] = None

class FinancePaymentCreate(BaseModel):
    amount: float
    notes: Optional[str] = None


# ─── Car Listings ─────────────────────────────────────────────────────────────

class CarListingCreate(BaseModel):
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
    images: List[str] = []
    contactPhone: str
    location: str
