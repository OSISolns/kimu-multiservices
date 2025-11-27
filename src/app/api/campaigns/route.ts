import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInput, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse } from '@/lib/errors';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  reach: z.number().int().min(0, 'Reach must be a non-negative integer').optional().default(0),
  engagement: z.number().int().min(0, 'Engagement must be a non-negative integer').optional().default(0),
  leads: z.number().int().min(0, 'Leads must be a non-negative integer').optional().default(0),
  conversions: z.number().int().min(0, 'Conversions must be a non-negative integer').optional().default(0),
  budget: z.number().min(0, 'Budget must be non-negative').optional().default(0),
  startDate: z.string().datetime('Start date must be a valid date').optional(),
  endDate: z.string().datetime('End date must be a valid date'),
  createdBy: z.number().int().positive('Created by must be a positive integer')
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateInput(createCampaignSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { name, reach, engagement, leads, conversions, budget, startDate, endDate, createdBy } = validation.data!;

    // Sanitize string inputs
    const sanitizedName = sanitizeString(name);

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: sanitizedName,
        reach: reach || 0,
        engagement: engagement || 0,
        leads: leads || 0,
        conversions: conversions || 0,
        budget: budget || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate)
      }
    });

    // Log the campaign creation
    await logActivity(
      createdBy,
      'CAMPAIGN_CREATED',
      `Campaign created: ${sanitizedName} (ID: ${campaign.id})`
    );

    await logInfo(`Campaign created successfully`, {
      userId: createdBy,
      action: 'CAMPAIGN_CREATED',
      details: {
        campaignId: campaign.id,
        name: sanitizedName
      }
    });

    return createSuccessResponse({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        reach: campaign.reach,
        engagement: campaign.engagement,
        leads: campaign.leads,
        conversions: campaign.conversions,
        budget: campaign.budget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      }
    });

  } catch (error) {
    await logError('Failed to create campaign', error as Error, {
      action: 'CREATE_CAMPAIGN_FAILED'
    });
    return handleApiError(error, '/api/campaigns');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.campaign.count()
    ]);

    return createSuccessResponse({
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        reach: campaign.reach,
        engagement: campaign.engagement,
        leads: campaign.leads,
        conversions: campaign.conversions,
        budget: campaign.budget,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    await logError('Failed to fetch campaigns', error as Error, {
      action: 'FETCH_CAMPAIGNS_FAILED'
    });
    return handleApiError(error, '/api/campaigns');
  }
}