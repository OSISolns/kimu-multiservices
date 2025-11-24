import { StaffPerformance } from '@/types/reports';

export const getTopPerformer = (staff: StaffPerformance[]): StaffPerformance => {
  if (!staff || staff.length === 0) {
    return {
      id: 0,
      name: 'No Data',
      role: '',
      totalBookings: 0,
      totalRevenue: 0,
      revenue: 0,
      bookings: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      leads: 0,
      feedback: 0,
      reviews: 0
    };
  }
  return staff.reduce((top, s) => (s.revenue > top.revenue ? s : top), staff[0]);
};

export const getAverageBookingValue = (staff: StaffPerformance): number => {
  return staff.bookings ? Math.round(staff.revenue / staff.bookings) : 0;
};

export const getConversionRate = (staff: StaffPerformance): number => {
  return staff.leads ? Math.round((staff.bookings / staff.leads) * 100) : 0;
};

export const getCommission = (staff: StaffPerformance): number => {
  // Commission calculation - will be populated from database
  return Math.round(staff.revenue * 0.05);
};

export const filterStaffByName = (staff: StaffPerformance[], filter: string): StaffPerformance[] => {
  if (!staff || staff.length === 0) return [];
  return staff.filter(s => s?.name?.toLowerCase().includes(filter.toLowerCase()));
};

export const sortStaff = (staff: StaffPerformance[], key: string, asc: boolean): StaffPerformance[] => {
  if (!staff || staff.length === 0) return [];
  return [...staff].sort((a, b) => {
    const aValue = (a as any)[key];
    const bValue = (b as any)[key];
    
    if (key === 'name') {
      return asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return asc ? aValue - bValue : bValue - aValue;
  });
};

export const formatRWF = (num: number | undefined | null): string => {
  if (num === undefined || num === null || isNaN(num)) return '0 RWF';
  return num.toLocaleString('en-US') + ' RWF';
};

export const getSuccessRate = (staff: StaffPerformance): number => {
  return staff.bookings ? Math.round((staff.completed / staff.bookings) * 100) : 0;
};

export const getPerformancePercentage = (staff: StaffPerformance, topPerformer: StaffPerformance): number => {
  return Math.round((staff.totalRevenue / Math.max(topPerformer.totalRevenue, 1)) * 100);
};

