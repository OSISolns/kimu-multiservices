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

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });

    // OPTIMIZED: Fetch all data in parallel instead of N+1 queries
    const [allBookings, allPayments] = await Promise.all([
      prisma.booking.findMany({
        where: dateFilter,
        select: {
          id: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.payment.findMany({
        where: {
          ...dateFilter,
          status: 'completed'
        },
        select: {
          id: true,
          amount: true,
          paymentDate: true
        }
      })
    ]);

    // Calculate total revenue once
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const revenuePerUser = totalRevenue / Math.max(users.length, 1);

    // Process staff performance data
    const staffPerformance = users.map((user) => {
      // For now, distribute bookings and revenue equally among staff
      // In a real system, you'd track which staff member created which booking
      const totalBookings = Math.floor(allBookings.length / users.length);
      const completedBookings = Math.floor(allBookings.filter(b => b.status === 'Completed').length / users.length);
      const pendingBookings = Math.floor(allBookings.filter(b => b.status === 'Pending').length / users.length);
      const cancelledBookings = Math.floor(allBookings.filter(b => b.status === 'Cancelled').length / users.length);
      
      // Mock data for fields not yet in database
      const leads = Math.floor(Math.random() * 50) + 10; // Mock leads
      const feedback = Math.floor(Math.random() * 20) + 5; // Mock feedback
      const reviews = Math.floor(Math.random() * 15) + 3; // Mock reviews

      return {
        id: user.id,
        name: user.fullName || user.username,
        role: user.role,
        bookings: totalBookings,
        revenue: Math.round(revenuePerUser),
        completed: completedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
        leads,
        feedback,
        reviews,
        usersManaged: user.role === 'admin' ? Math.floor(Math.random() * 10) + 5 : 0,
        systemActions: Math.floor(Math.random() * 100) + 20,
        repeatCustomers: Math.floor(Math.random() * 15) + 3,
        vehiclesManaged: user.role === 'tofficer' ? Math.floor(Math.random() * 20) + 10 : 0,
        maintenanceActions: user.role === 'tofficer' ? Math.floor(Math.random() * 30) + 15 : 0
      };
    });

    // Get monthly trends for staff performance
    const months = [];
    const staffTrends: { [key: string]: number[] } = {};

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

      // Get monthly data for each staff member
      for (const user of users) {
        const monthBookings = await prisma.booking.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
            // Note: You might need to track which staff member created the booking
          }
        });

        if (!staffTrends[user.username]) {
          staffTrends[user.username] = [];
        }
        staffTrends[user.username].push(monthBookings);
      }
    }

    return NextResponse.json({
      staffPerformance,
      months,
      staffTrends
    });

  } catch (error) {
    console.error('Error fetching staff performance:', error);
    return NextResponse.json({ error: 'Failed to fetch staff performance data' }, { status: 500 });
  }
}
