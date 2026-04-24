# KIMU Transport & Multiservices

A modern, responsive website for KIMU Transport & Multiservices, a premier car rental and tour services company in Rwanda.

## Features

- 🚗 **Car Rental System** - Complete booking system with vehicle management
- 🏨 **Hotel Accommodation** - Hotel booking and management
- 🚕 **Taxi Services** - Executive taxi booking system
- ✈️ **Airport Transfers** - Seamless airport pickup/drop-off services
- 🔐 **Agent Portal** - Secure admin dashboard with TOTP 2FA
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI/UX** - Beautiful animations with Framer Motion
- 📊 **Analytics Dashboard** - Booking statistics and reports
- 🔔 **Notification System** - Email and WhatsApp integrations
- 💳 **Payment Integration** - Multiple payment methods support

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: SQLite with Prisma ORM
- **Authentication**: TOTP (Two-Factor Authentication)
- **Deployment**: Vercel
- **Icons**: React Icons
- **Charts**: Chart.js with React Chart.js 2

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KIMU
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   DATABASE_URL="file:./dev.db"
   WHATSAPP_ACCESS_TOKEN="your_whatsapp_token"
   WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id"
   ```

4. **Set up the database**
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Default Login Credentials

- **Agent**: `agent1` / `agent1@2025`
- **Admin**: `admin` / `kimu@2025`

## Production Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - `DATABASE_URL` - Your production database URL
   - `WHATSAPP_ACCESS_TOKEN` - WhatsApp Business API token
   - `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp phone number ID

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API token | No |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | No |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── agent/             # Agent dashboard pages
│   ├── api/               # API routes
│   ├── offers/            # Service offerings
│   └── rent-a-car/        # Car rental pages
├── components/            # Reusable components
├── data/                  # Static data (vehicles, etc.)
├── generated/             # Prisma generated files
└── services/              # External service integrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data
- `npm run vercel-build` - Build command for Vercel

## Services Offered

- 🚗 **Car Rental** - Self-drive and chauffeur-driven options
- 🏨 **Hotel Accommodation** - Partner hotel bookings
- 🚕 **Executive Taxi** - Premium taxi services
- ✈️ **Airport Transfers** - Reliable airport transportation
- 🛠️ **Computer Services** - IT support and services
- 🏗️ **Engineering** - Technical consulting
- 📋 **Irembo Services** - Government service assistance
- 📦 **Supplying** - Equipment and supplies
- 📚 **Education** - Training and educational services
- 🧹 **Cleaning** - Professional cleaning services

## Contact Information

- **Phone**:  +250 792 958 752
- **Email**: kimutransport6@gmail.com
- **Address**: KG 24 St, Kigali, Rwanda
- **Website**: [kimutransport.co.rw](https://kimutransport.co.rw)

## License

This project is licensed under the ISC License.

## Support

For support and inquiries, please contact the development team or reach out through the contact form on the website.
