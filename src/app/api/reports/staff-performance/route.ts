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

    // Fetch staff performance data
    const staffPerformance = await Promise.all(
      users.map(async (user) => {
        // Get bookings for this user
        const userBookings = await prisma.booking.findMany({
          where: {
            ...dateFilter,
            // Note: You might need to add a field to track which staff member created the booking
            // For now, we'll use all bookings in the period
          }
        });

        // Get payments for this user's bookings
        const userPayments = await prisma.payment.findMany({
          where: {
            ...dateFilter,
            status: 'completed'
            // Note: You might need to link payments to specific users
          }
        });

        // Calculate metrics
        const totalBookings = userBookings.length;
        const completedBookings = userBookings.filter(b => b.status === 'Completed').length;
        const pendingBookings = userBookings.filter(b => b.status === 'Pending').length;
        const cancelledBookings = userBookings.filter(b => b.status === 'Cancelled').length;
        
        // For now, we'll distribute revenue equally among staff
        // In a real system, you'd track which staff member generated which revenue
        const totalRevenue = userPayments.reduce((sum, p) => sum + p.amount, 0) / Math.max(users.length, 1);
        
        // Mock data for fields not yet in database
        const leads = Math.floor(Math.random() * 50) + 10; // Mock leads
        const feedback = Math.floor(Math.random() * 20) + 5; // Mock feedback
        const reviews = Math.floor(Math.random() * 15) + 3; // Mock reviews

        return {
          id: user.id,
          name: user.fullName || user.username,
          role: user.role,
          bookings: totalBookings,
          revenue: Math.round(totalRevenue),
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
      })
    );

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
