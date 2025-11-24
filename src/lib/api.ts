import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodTypeAny } from 'zod'

type HandlerWithBody<T> = (req: NextRequest, body: T) => Promise<NextResponse>

export function jsonOk(data: Record<string, unknown>, init?: ResponseInit) {
  return NextResponse.json({ success: true, ...data }, init)
}

export function jsonError(message: string, status: number = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status })
}

export function withValidation<T extends ZodTypeAny>(schema: T, handler: HandlerWithBody<ReturnType<T['parse']>>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const raw = await req.json()
      const parsed = schema.parse(raw) as ReturnType<T['parse']>
      return await handler(req, parsed)
    } catch (err: any) {
      if (err?.issues) {
        const errors = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`)
        return jsonError('Validation failed', 422, { errors })
      }
      return jsonError('Invalid request body', 400)
    }
  }
}

export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API error:', error)
      return jsonError('Internal server error', 500)
    }
  }
}


