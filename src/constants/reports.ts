// Constants for Reports & Analytics

export const CHART_COLORS = {
  primary: 'rgba(59, 130, 246, 0.7)', // blue
  secondary: 'rgba(251, 191, 36, 0.7)', // yellow
  success: 'rgba(16, 185, 129, 0.7)', // green
  warning: 'rgba(251, 146, 60, 0.7)', // orange
  info: 'rgba(99, 102, 241, 0.7)', // indigo
  danger: 'rgba(239, 68, 68, 0.7)', // red
  bookings: {
    background: 'rgba(59, 130, 246, 0.5)',
    border: 'rgba(59, 130, 246, 1)',
  },
  revenue: {
    background: 'rgba(16, 185, 129, 0.3)',
    border: 'rgba(16, 185, 129, 1)',
  },
};

export const EXCEL_COLORS = {
  headerBlue: 'FF2563EB',
  headerGreen: 'FF16A34A',
  headerRed: 'FFDC2626',
  headerPurple: 'FF059669',
  headerDark: 'FF1F4E79',
  white: 'FFFFFFFF',
  lightGreen: 'FFDCFCE7',
  lightRed: 'FFFEE2E2',
  lightGray: 'FFF3F4F6',
  lightGreenBg: 'FFF0FDF4',
  lightRedBg: 'FFFEF2F2',
  successGreen: 'FF16A34A',
  dangerRed: 'FFDC2626',
};

export const EXCEL_COLUMN_WIDTHS = {
  small: 10,
  medium: 15,
  large: 20,
  xlarge: 25,
  xxlarge: 22,
};

export const SERVICE_LABELS = ['Car Rentals', 'Taxis', 'Transfers', 'Hotels', 'Sales'];

export const CHART_OPTIONS = {
  trends: {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Monthly Trends (Bookings & Revenue)' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Bookings' } },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Revenue (RWF)' },
      },
    },
  },
  statusPie: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
      title: { display: true, text: 'Booking Status Breakdown' },
    },
  },
  serviceBar: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Bookings by Service Type', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Bookings' } },
    },
  },
};

export const STATUS_ICONS = {
  Completed: { icon: 'FaCheck', color: 'text-green-600', textColor: 'text-green-800' },
  Pending: { icon: 'FaHourglassHalf', color: 'text-yellow-600', textColor: 'text-yellow-800' },
  Cancelled: { icon: 'FaTimes', color: 'text-red-600', textColor: 'text-red-800' },
} as const;

export const TAB_CONFIG = [
  { id: 'trends', label: 'Trends' },
  { id: 'status', label: 'Status Breakdown' },
  { id: 'service', label: 'Service Distribution' },
  { id: 'activity', label: 'Recent Activity' },
  { id: 'staff', label: 'Staff Performance' },
  { id: 'finance', label: 'Finance' },
] as const;

export const FINANCIAL_PERIODS = [
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Date Range' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
] as const;

export const SORT_OPTIONS = [
  { value: 'revenue', label: 'Sort by Revenue' },
  { value: 'bookings', label: 'Sort by Bookings' },
  { value: 'name', label: 'Sort by Name' },
] as const;
