import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInput, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse } from '@/lib/errors';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { z } from 'zod';

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
    // Note: Activity model doesn't have userId, so we don't save createdBy in the table
    const newActivity = await prisma.activity.create({
      data: {
        client: sanitizedClient,
        activity: sanitizedActivity,
        outcome: sanitizedOutcome,
        type: type,
        date: date ? new Date(date) : new Date(),
      }
    });

    // Log the activity creation in system logs
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
        date: newActivity.date.toISOString(),
        client: newActivity.client,
        activity: newActivity.activity,
        outcome: newActivity.outcome,
        type: newActivity.type,
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Note: Activity model doesn't have userId, so we can't filter by userId

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.activity.count()
    ]);

    return createSuccessResponse({
      activities: activities.map(activity => ({
        id: activity.id.toString(),
        date: activity.date.toISOString(),
        client: activity.client,
        activity: activity.activity,
        outcome: activity.outcome,
        type: activity.type,
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