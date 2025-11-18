import type { NextRequest } from 'next/server'
import * as leads from '@/app/api/leads/route'

export const GET = (req: NextRequest) => leads.GET(req)
export const POST = (req: NextRequest) => leads.POST(req)
