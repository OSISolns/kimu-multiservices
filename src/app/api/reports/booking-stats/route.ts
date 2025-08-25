import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    // Fetch real booking data from database
    const [totalBookings, carRentals, taxis, transfers, hotels, sales] = await Promise.all([
      prisma.booking.count({ where: dateFilter }),
      prisma.booking.count({ 
        where: { 
          ...dateFilter,
          type: 'Car Rental' 
        } 
      }),
      prisma.booking.count({ 
        where: { 
          ...dateFilter,
          type: 'Taxi Service' 
        } 
      }),
      prisma.booking.count({ 
        where: { 
          ...dateFilter,
          type: 'Airport Transfer' 
        } 
      }),
      prisma.booking.count({ 
        where: { 
          ...dateFilter,
          type: 'Hotel' 
        } 
      }),
      prisma.booking.count({ 
        where: { 
          ...dateFilter,
          type: 'Car Sales' 
        } 
      })
    ]);

    // Calculate total revenue from payments
    const payments = await prisma.payment.findMany({
      where: {
        ...dateFilter,
        status: 'completed'
      }
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get status breakdown
    const statusBreakdown = await prisma.booking.groupBy({
      by: ['status'],
      where: dateFilter,
      _count: {
        status: true
      }
    });

    const statusData: { [key: string]: number } = {};
    statusBreakdown.forEach(item => {
      statusData[item.status] = item._count.status;
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: dateFilter,
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        createdAt: true
      }
    });

    // Get monthly trends for the last 12 months
    const months = [];
    const bookingsTrend = [];
    const revenueTrend = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthBookings = await prisma.booking.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      const monthPayments = await prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: monthStart,
            lte: monthEnd
          },
          status: 'completed'
        }
      });

      const monthRevenue = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);

      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      bookingsTrend.push(monthBookings);
      revenueTrend.push(monthRevenue);
    }

    const summary = {
      totalBookings,
      totalRevenue,
      rentals: carRentals,
      taxis,
      transfers,
      hotels,
      sales
    };

    const trendsLabels = months;
    const trendsData = {
      labels: trendsLabels,
      datasets: [
        {
          label: 'Bookings',
          data: bookingsTrend,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          type: 'bar' as const,
          yAxisID: 'y',
        },
        {
          label: 'Revenue (RWF)',
          data: revenueTrend,
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          borderColor: 'rgba(16, 185, 129, 1)',
          type: 'line' as const,
          yAxisID: 'y1',
          fill: false,
          tension: 0.4,
        },
      ],
    };

    const statusPieData = {
      labels: Object.keys(statusData),
      datasets: [
        {
          label: 'Status',
          data: Object.values(statusData),
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)', // green
            'rgba(251, 191, 36, 0.7)', // yellow
            'rgba(239, 68, 68, 0.7)', // red
          ],
          borderWidth: 1,
        },
      ],
    };

    const serviceLabels = ['Car Rentals', 'Taxis', 'Transfers', 'Hotels', 'Sales'];
    const serviceBookings = [carRentals, taxis, transfers, hotels, sales];
    const serviceBarData = {
      labels: serviceLabels,
      datasets: [
        {
          label: 'Bookings',
          data: serviceBookings,
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)', // blue
            'rgba(251, 191, 36, 0.7)', // yellow
            'rgba(16, 185, 129, 0.7)', // green
            'rgba(251, 146, 60, 0.7)', // orange
            'rgba(99, 102, 241, 0.7)', // indigo
          ],
          borderRadius: 8,
        },
      ],
    };

    return NextResponse.json({
      summary,
      trendsLabels,
      trendsData,
      statusBreakdown: statusData,
      statusPieData,
      serviceLabels,
      serviceBookings,
      serviceBarData,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        type: booking.type,
        name: booking.name || 'Unknown',
        status: booking.status,
        date: booking.createdAt.toISOString().split('T')[0]
      }))
    });

  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json({ error: 'Failed to fetch booking statistics' }, { status: 500 });
  }
}
