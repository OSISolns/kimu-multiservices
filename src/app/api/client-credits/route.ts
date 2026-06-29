import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkPermissions(role: string) {
  return ['admin', 'manager', 'accountant', 'operations', 'staff'].includes(role)
}

export async function GET(req: NextRequest) {
  try {
    const username = req.headers.get('x-username')
    if (!username) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !checkPermissions(user.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const credits = await prisma.clientCredit.findMany({
      orderBy: { nextPaymentDate: 'asc' }
    })

    return NextResponse.json({ success: true, credits })
  } catch (error) {
    console.error('GET client-credits error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const username = req.headers.get('x-username')
    if (!username) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !checkPermissions(user.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body = await req.json()
    const { clientName, whatsappNumber, totalCredit, paidAmount, dailyPayment, nextPaymentDate, status, notes } = body

    if (!clientName || !whatsappNumber || totalCredit === undefined || dailyPayment === undefined || !nextPaymentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newCredit = await prisma.clientCredit.create({
      data: {
        clientName,
        whatsappNumber,
        totalCredit: parseFloat(totalCredit),
        paidAmount: parseFloat(paidAmount || 0),
        dailyPayment: parseFloat(dailyPayment),
        nextPaymentDate,
        status: status || 'active',
        notes: notes || null
      }
    })

    return NextResponse.json({ success: true, credit: newCredit })
  } catch (error) {
    console.error('POST client-credits error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
