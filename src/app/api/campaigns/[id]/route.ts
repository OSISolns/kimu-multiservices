import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInput, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse } from '@/lib/errors';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { z } from 'zod';

const updateCampaignSchema = z.object({
    name: z.string().min(1, 'Campaign name is required').optional(),
    reach: z.number().int().min(0, 'Reach must be a non-negative integer').optional(),
    engagement: z.number().int().min(0, 'Engagement must be a non-negative integer').optional(),
    leads: z.number().int().min(0, 'Leads must be a non-negative integer').optional(),
    conversions: z.number().int().min(0, 'Conversions must be a non-negative integer').optional(),
    budget: z.number().min(0, 'Budget must be non-negative').optional(),
    startDate: z.string().datetime('Start date must be a valid date').optional(),
    endDate: z.string().datetime('End date must be a valid date').optional(),
    status: z.enum(['Active', 'Paused', 'Completed', 'Draft']).optional(),
    userId: z.number().int().positive('User ID must be a positive integer').optional()
});

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const campaign = await prisma.campaign.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        return createSuccessResponse({ campaign });
    } catch (error) {
        await logError('Failed to fetch campaign', error as Error, {
            action: 'FETCH_CAMPAIGN_FAILED',
            details: { campaignId: id }
        });
        return handleApiError(error, `/api/campaigns/${id}`);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();

        // Validate input
        const validation = validateInput(updateCampaignSchema, body);
        if (!validation.success) {
            return createValidationErrorResponse(validation.errors!);
        }

        const data = validation.data!;
        const updateData: any = {};

        if (data.name) updateData.name = sanitizeString(data.name);
        if (data.reach !== undefined) updateData.reach = data.reach;
        if (data.engagement !== undefined) updateData.engagement = data.engagement;
        if (data.leads !== undefined) updateData.leads = data.leads;
        if (data.conversions !== undefined) updateData.conversions = data.conversions;
        if (data.budget !== undefined) updateData.budget = data.budget;
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);

        const campaign = await prisma.campaign.update({
            where: {
                id: parseInt(id)
            },
            data: updateData
        });

        if (data.userId) {
            await logActivity(
                data.userId,
                'CAMPAIGN_UPDATED',
                `Campaign updated: ${campaign.name} (ID: ${campaign.id})`
            );
        }

        return createSuccessResponse({ campaign });
    } catch (error) {
        await logError('Failed to update campaign', error as Error, {
            action: 'UPDATE_CAMPAIGN_FAILED',
            details: { campaignId: id }
        });
        return handleApiError(error, `/api/campaigns/${id}`);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { searchParams } = new URL(req.url);
        const userIdStr = searchParams.get('userId');
        const userId = userIdStr ? parseInt(userIdStr) : undefined;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(id) }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: 'Campaign not found' },
                { status: 404 }
            );
        }

        await prisma.campaign.delete({
            where: {
                id: parseInt(id)
            }
        });

        if (userId) {
            await logActivity(
                userId,
                'CAMPAIGN_DELETED',
                `Campaign deleted: ${campaign.name} (ID: ${campaign.id})`
            );
        }

        return createSuccessResponse({ message: 'Campaign deleted successfully' });
    } catch (error) {
        await logError('Failed to delete campaign', error as Error, {
            action: 'DELETE_CAMPAIGN_FAILED',
            details: { campaignId: id }
        });
        return handleApiError(error, `/api/campaigns/${id}`);
    }
}
