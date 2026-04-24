# KIMU Transport & Multiservices - Application Documentation

This document provides a comprehensive overview of the **KIMU Transport & Multiservices** web application. It covers the technical stack, database schema, user roles, core modules, and system architecture.

## 1. Tech Stack Overview

The application is built using a modern full-stack web development paradigm:

*   **Framework:** Next.js (Version 16+) utilizing the App Router (`src/app`).
*   **Language:** TypeScript throughout both the frontend and backend API routes.
*   **Database ORM:** Prisma (v6.19.1) configured with the `driverAdapters` preview feature.
*   **Database Engine:** SQLite (specifically integrated with Turso via `@libsql/client`).
*   **Styling:** Tailwind CSS with `framer-motion` for advanced UI animations.
*   **Authentication:** Custom JWT-based authentication combined with `bcryptjs` for password hashing and a React Context (`UserContext.tsx`) for client-side session management.
*   **PDF Generation:** `jspdf` used extensively for generating official invoices, receipts, and quotations on the client and server sides.
*   **Email Services:** `nodemailer` and `resend` for sending transactional emails (invoices, reports, password resets).
*   **Data Export/Visualization:** `exceljs` and `fast-csv` for data exports, and `Chart.js` (`react-chartjs-2`) for dashboard analytics.

---

## 2. Role-Based Access Control (RBAC)

The system is highly roles-driven. User accounts are created with specific roles that govern their access to different internal portals (`/staff/*`).

### Defined Roles:
1.  **Administrator (`admin`)**: Full access to all modules, including system settings, global activity logs, employee management, and cross-departmental dashboards.
2.  **Manager (`manager`)**: High-level access to operations, financial overviews, and team performance metrics.
3.  **Accountant (`accountant`)**: Dedicated access to the Financial Dashboard (`/staff/accountant-dashboard`), invoices, income/expenses, payroll, and petty cash.
4.  **Sales Representative / Agent (`sales`, `sales-representative`, `agent`)**: Access to the Sales Dashboard, Leads CRM, Quotes generation, and Campaign tracking.
5.  **Transport Officer (`transport-officer`)**: Access to fleet management, vehicle inventory, and transport bookings (Airport transfers, Taxi requests).

---

## 3. Core System Modules

The application is split into two primary areas: the **Public Facing Website** and the **Internal Staff Portal**.

### 3.1 Public Website (`src/app/`)
Designed for customer acquisition and self-service.
*   **Home & Services:** Landing page detailing transport, car rental, and tour offerings.
*   **Rent-A-Car:** Inventory browsing for available rental vehicles.
*   **Offers/Tours:** Pre-packaged service offerings and discounts.
*   **Contact:** Inquiry forms that feed directly into the internal Notification/Inbox systems.
*   **MFA & Authentication:** Secure endpoints for staff login and multifactor checks.

### 3.2 Staff Management Portal (`src/app/staff/`)
The internal operating system for the business.
*   **Sales & CRM (`/sales-dashboard`)**:
    *   Pipeline management (Leads & Prospects).
    *   Quote & Proposal generation (PDF outputs with watermarks).
    *   Campaign tracking and ROI analytics.
*   **Operations & Transport (`/operations-dashboard`, `/transport_officer-dashboard`)**:
    *   Vehicle fleet inventory tracking (status, maintenance logs, specifications).
    *   Booking management (Flights, Taxis, Rentals).
*   **Accounting & Finance (`/accountant-dashboard`)**:
    *   Income and Expense tracking.
    *   Invoice generation and automated emailing (official KIMU templates).
    *   Petty Cash ledgers.
    *   Budgeting and financial reporting.
*   **Human Resources (`/payroll-management`, `/users`)**:
    *   Employee onboarding and directory.
    *   Salary structures, allowances, and deductions.
    *   Automated payroll processing and payslip generation.
*   **Administration (`/admin-dashboard`)**:
    *   System & Activity Logs auditing.
    *   User role management and permission scoping.
    *   Global notification dispatching.

---

## 4. Database Schema (Prisma)

The application utilizes a highly relational SQLite database schema. Key entities include:

### Identity & Access
*   **User**: Handles authentication credentials, role definitions, notification preferences, and privacy settings.
*   **Employee**: Linked to `User`, handling HR-specific data like salary, bank details, tax IDs, and employment status.

### Transport & Operations
*   **Vehicle**: Fleet inventory detailing make, model, category, price, availability, and maintenance schedules.
*   **Booking**: Customer reservations holding pickup/dropoff logistics, dates, and associated vehicle data.
*   **CarListing**: For managing vehicles listed for sale (e.g., "Sell Your Car" feature).

### Financial & Accounting
*   **Income & Expense**: Ledger entries categorized by business unit (e.g., car_rental, fuel, maintenance).
*   **Invoice**: Detailed billing records linked to clients, tracking tax amounts, totals, and payment status.
*   **Payment**: Transaction records tied to Bookings.
*   **Payroll & SalaryStructure**: Monthly salary calculations, tracking gross/net pay, overtime, and tax deductions.
*   **Budget & PettyCashTransaction**: Financial planning and day-to-day liquidity tracking.

### CRM & Sales
*   **Lead**: Potential customers tracked through a sales pipeline.
*   **Quote**: Proposed service costs linked to Leads.
*   **Campaign**: Marketing efforts tracked against budget and conversions.
*   **Activity**: Logs of client interactions (calls, emails, meetings).

### System & Reporting
*   **Notification**: Internal alerts routed to specific users.
*   **ActivityLog & SystemLog**: Security and audit trails.
*   **Report & ReportTemplate**: Configurable data queries for generating business intelligence exports.
*   **AnalyticsEvent**: Telemetry for user actions and system events.

---

## 5. Key Technical Implementations

### PDF Generation Engine
Located primarily in `src/lib/pdfGenerator.ts`, the system uses `jspdf` to create heavily branded, standardized documents.
*   **Features**: Official orange/green color schemes, embedded base64 logos, subtle background watermarks (via `doc.setGState({ opacity: 0.1 })`), and consistent company banking details.
*   **Types**: Invoices, Quotations, and Payment Receipts.

### Security
*   **Protected Routes**: The `UserContext.tsx` combined with Next.js middleware and `ProtectedRoute.tsx` wrapper ensures that API routes and frontend pages verify JWT validity and user roles before rendering.
*   **Password Management**: Standard bcrypt hashing on creation/reset.
*   **Strict Typing**: High reliance on TypeScript interfaces to prevent runtime null-reference errors (especially around User context loading states).

### Communications
*   **Email Templates**: Standardized HTML email templates (e.g., `src/templates/document-template.html`) are used by the `api/accounting/invoices/send-email` route to dispatch official communications directly to clients.

## 6. Maintenance & Extensibility

*   **Prisma Migrations**: As the schema evolves, use `npx prisma migrate dev` to update the SQLite database.
*   **Version Updates**: The system is flagged to monitor Next.js and Node.js engine compatibility (requires Node >= 18.17.0). Prisma is currently on `v6.19.1` with a recommended upgrade path to `v7.x` available.
