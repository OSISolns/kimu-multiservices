import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInput, sanitizeString } from '@/lib/validation';
import { handleApiError, createSuccessResponse, createValidationErrorResponse } from '@/lib/errors';
import { logActivity, logError, logInfo } from '@/lib/logger';
import { z } from 'zod';

const createQuoteSchema = z.object({
  customerId: z.number().int().positive('Customer ID must be a positive integer'),
  serviceType: z.string().min(1, 'Service type is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('RWF'),
  validUntil: z.string().datetime('Valid until must be a valid date'),
  notes: z.string().optional(),
  createdBy: z.number().int().positive('Created by must be a positive integer')
});

export async function POST(req: NextRequest) {
  try {
    // Debug: Check if prisma is defined
    console.log('Prisma client:', prisma);
    console.log('Prisma quote model:', prisma?.quote);

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = validateInput(createQuoteSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { customerId, serviceType, amount, currency, validUntil, notes, createdBy } = validation.data!;

    // Sanitize string inputs
    const sanitizedServiceType = sanitizeString(serviceType);
    const sanitizedNotes = notes ? sanitizeString(notes) : null;

    // Check if customer exists
    const customer = await prisma.lead.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        customerId,
        serviceType: sanitizedServiceType,
        amount,
        currency,
        validUntil: new Date(validUntil),
        notes: sanitizedNotes,
        createdBy
      },
      include: {
        customer: true
      }
    });

    // Log the activity
    await logActivity(
      createdBy,
      'QUOTE_CREATED',
      `Quote created for customer ${customer.name} - ${serviceType} (${currency} ${amount}) (ID: ${quote.id})`
    );

    await logInfo(`Quote created successfully`, {
      userId: createdBy,
      action: 'QUOTE_CREATED',
      details: {
        quoteId: quote.id,
        customerId: customerId,
        amount: amount
      }
    });

    return createSuccessResponse({
      quote: {
        id: quote.id,
        customerId: quote.customerId,
        customer: {
          id: quote.customer.id,
          name: quote.customer.name,
          company: quote.customer.company,
          email: quote.customer.email
        },
        serviceType: quote.serviceType,
        amount: quote.amount,
        currency: quote.currency,
        validUntil: quote.validUntil,
        status: quote.status,
        notes: quote.notes,
        createdAt: quote.createdAt
      }
    });

  } catch (error) {
    await logError('Failed to create quote', error as Error, {
      action: 'CREATE_QUOTE_FAILED'
    });
    return handleApiError(error, '/api/quotes');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = parseInt(customerId);
    if (status) where.status = status;

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          customer: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.quote.count({ where })
    ]);

    return createSuccessResponse({
      quotes: quotes.map(quote => ({
        id: quote.id,
        customerId: quote.customerId,
        customer: {
          id: quote.customer.id,
          name: quote.customer.name,
          company: quote.customer.company,
          email: quote.customer.email
        },
        serviceType: quote.serviceType,
        amount: quote.amount,
        currency: quote.currency,
        validUntil: quote.validUntil,
        status: quote.status,
        notes: quote.notes,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    await logError('Failed to fetch quotes', error as Error, {
      action: 'FETCH_QUOTES_FAILED'
    });
    return handleApiError(error, '/api/quotes');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    // Validate input if necessary, for now we assume partial updates are allowed
    // and we trust the input types match the schema roughly.
    // Ideally use a partial schema of createQuoteSchema

    const quoteId = parseInt(id);

    const existingQuote = await prisma.quote.findUnique({
      where: { id: quoteId }
    });

    if (!existingQuote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        customer: true
      }
    });

    await logActivity(
      updatedQuote.createdBy, // Assuming createdBy is preserved or passed in body if changed, otherwise use existing
      'QUOTE_UPDATED',
      `Quote updated (ID: ${updatedQuote.id})`
    );

    return createSuccessResponse({
      quote: {
        id: updatedQuote.id,
        customerId: updatedQuote.customerId,
        customer: {
          id: updatedQuote.customer.id,
          name: updatedQuote.customer.name,
          company: updatedQuote.customer.company,
          email: updatedQuote.customer.email
        },
        serviceType: updatedQuote.serviceType,
        amount: updatedQuote.amount,
        currency: updatedQuote.currency,
        validUntil: updatedQuote.validUntil,
        status: updatedQuote.status,
        notes: updatedQuote.notes,
        createdAt: updatedQuote.createdAt,
        updatedAt: updatedQuote.updatedAt
      }
    });

  } catch (error) {
    await logError('Failed to update quote', error as Error, {
      action: 'UPDATE_QUOTE_FAILED'
    });
    return handleApiError(error, '/api/quotes');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    const quoteId = parseInt(id);

    const existingQuote = await prisma.quote.findUnique({
      where: { id: quoteId }
    });

    if (!existingQuote) {
      return NextResponse.json(
        { success: false, error: 'Quote not found' },
        { status: 404 }
      );
    }

    await prisma.quote.delete({
      where: { id: quoteId }
    });

    await logActivity(
      existingQuote.createdBy,
      'QUOTE_DELETED',
      `Quote deleted (ID: ${quoteId})`
    );

    return createSuccessResponse({
      success: true,
      message: 'Quote deleted successfully'
    });

  } catch (error) {
    await logError('Failed to delete quote', error as Error, {
      action: 'DELETE_QUOTE_FAILED'
    });
    return handleApiError(error, '/api/quotes');
  }
}
