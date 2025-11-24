import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateInput, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse } from '@/lib/errors';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { z } from 'zod';

// Create a new Prisma client instance
const prisma = new PrismaClient();

const createActivitySchema = z.object({
  client: z.string().min(1, 'Client name is required'),
  activity: z.string().min(1, 'Activity description is required'),
  outcome: z.string().min(1, 'Outcome is required'),
  type: z.enum(['call', 'meeting', 'email', 'visit']),
  date: z.string().datetime('Date must be a valid date').optional(),
  createdBy: z.number().int().positive('Created by must be a positive integer')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = validateInput(createActivitySchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { client, activity, outcome, type, date, createdBy } = validation.data!;
    
    // Sanitize string inputs
    const sanitizedClient = sanitizeString(client);
    const sanitizedActivity = sanitizeString(activity);
    const sanitizedOutcome = sanitizeString(outcome);
    
    // Create the activity
    const newActivity = await prisma.activityLog.create({
      data: {
        action: sanitizedActivity,
        details: `Client: ${sanitizedClient}, Outcome: ${sanitizedOutcome}, Type: ${type}`,
        userId: createdBy
      }
    });

    // Log the activity creation
    await logActivity(
      createdBy,
      'ACTIVITY_LOGGED',
      `Activity logged: ${sanitizedActivity} for ${sanitizedClient} (ID: ${newActivity.id})`
    );

    await logInfo(`Activity logged successfully`, {
      userId: createdBy,
      action: 'ACTIVITY_CREATED',
      details: {
        activityId: newActivity.id,
        client: sanitizedClient
      }
    });

    return createSuccessResponse({
      activity: {
        id: newActivity.id.toString(),
        date: newActivity.createdAt.toISOString(),
        client: sanitizedClient,
        activity: sanitizedActivity,
        outcome: sanitizedOutcome,
        type: type,
        createdAt: newActivity.createdAt
      }
    });

  } catch (error) {
    await logError('Failed to log activity', error as Error, {
      action: 'LOG_ACTIVITY_FAILED'
    });
    return handleApiError(error, '/api/activities');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = parseInt(userId);

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.activityLog.count({ where })
    ]);

    return createSuccessResponse({
      activities: activities.map(activity => ({
        id: activity.id.toString(),
        date: activity.createdAt.toISOString(),
        client: activity.details?.split(',')[0]?.replace('Client: ', '') || 'Unknown',
        activity: activity.action,
        outcome: activity.details?.split(',')[1]?.replace(' Outcome: ', '') || 'Unknown',
        type: activity.details?.split(',')[2]?.replace(' Type: ', '') || 'call',
        createdAt: activity.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    await logError('Failed to fetch activities', error as Error, {
      action: 'FETCH_ACTIVITIES_FAILED'
    });
    return handleApiError(error, '/api/activities');
  }
}