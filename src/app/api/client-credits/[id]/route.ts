import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkPermissions(role: string) {
  return ['admin', 'manager', 'accountant', 'operations', 'staff'].includes(role)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

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

    const existing = await prisma.clientCredit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Credit record not found' }, { status: 404 })
    }

    const dataToUpdate: any = {}
    if (clientName !== undefined) dataToUpdate.clientName = clientName
    if (whatsappNumber !== undefined) dataToUpdate.whatsappNumber = whatsappNumber
    if (totalCredit !== undefined) dataToUpdate.totalCredit = parseFloat(totalCredit)
    if (paidAmount !== undefined) dataToUpdate.paidAmount = parseFloat(paidAmount)
    if (dailyPayment !== undefined) dataToUpdate.dailyPayment = parseFloat(dailyPayment)
    if (nextPaymentDate !== undefined) dataToUpdate.nextPaymentDate = nextPaymentDate
    if (status !== undefined) dataToUpdate.status = status
    if (notes !== undefined) dataToUpdate.notes = notes

    // If paidAmount matches or exceeds totalCredit, auto-resolve status to 'paid'
    if (dataToUpdate.paidAmount !== undefined && dataToUpdate.totalCredit !== undefined) {
      if (dataToUpdate.paidAmount >= dataToUpdate.totalCredit) {
        dataToUpdate.status = 'paid'
      }
    } else if (dataToUpdate.paidAmount !== undefined) {
      if (dataToUpdate.paidAmount >= existing.totalCredit) {
        dataToUpdate.status = 'paid'
      }
    }

    const updated = await prisma.clientCredit.update({
      where: { id },
      data: dataToUpdate
    })

    return NextResponse.json({ success: true, credit: updated })
  } catch (error) {
    console.error('PUT client-credits error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const username = req.headers.get('x-username')
    if (!username) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user || !checkPermissions(user.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const existing = await prisma.clientCredit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Credit record not found' }, { status: 404 })
    }

    await prisma.clientCredit.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Credit record deleted successfully' })
  } catch (error) {
    console.error('DELETE client-credits error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
