import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/data-export - Export user's personal data
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'json';

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch user data with relations
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                trustedDevices: true,
                employee: true,
                reportTemplates: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                reports: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Remove sensitive data
        const exportData = {
            profile: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                department: user.department,
                status: user.status,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
            },
            preferences: {
                theme: user.theme,
                language: user.language,
                timezone: user.timezone,
                emailNotifications: user.emailNotifications,
                whatsappNotifications: user.whatsappNotifications,
            },
            privacy: {
                profileVisibility: user.profileVisibility,
                showEmail: user.showEmail,
                showPhone: user.showPhone,
            },
            trustedDevices: user.trustedDevices.map(device => ({
                deviceName: device.deviceName,
                deviceType: device.deviceType,
                browserName: device.browserName,
                osName: device.osName,
                lastUsed: device.lastUsed,
                createdAt: device.createdAt,
            })),
            employee: user.employee ? {
                employeeId: user.employee.employeeId,
                position: user.employee.position,
                department: user.employee.department,
                employmentType: user.employee.employmentType,
                hireDate: user.employee.hireDate,
                status: user.employee.status,
            } : null,
            exportedAt: new Date().toISOString(),
        };

        if (format === 'csv') {
            // Simple CSV format for basic profile data
            const csv = [
                'Field,Value',
                `Username,${user.username}`,
                `Full Name,${user.fullName || ''}`,
                `Email,${user.email || ''}`,
                `Phone,${user.phone || ''}`,
                `Role,${user.role}`,
                `Department,${user.department || ''}`,
                `Status,${user.status}`,
                `Created At,${user.createdAt}`,
                `Theme,${user.theme || 'system'}`,
                `Language,${user.language || 'en'}`,
                `Timezone,${user.timezone || 'Africa/Kigali'}`,
            ].join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="user-data-${userId}-${Date.now()}.csv"`,
                },
            });
        }

        // JSON format
        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="user-data-${userId}-${Date.now()}.json"`,
            },
        });
    } catch (error) {
        console.error('Error exporting user data:', error);
        return NextResponse.json(
            { error: 'Failed to export user data' },
            { status: 500 }
        );
    }
}
