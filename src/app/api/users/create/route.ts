import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(['admin', 'manager', 'staff', 'accountant', 'transport-officer', 'agent']).optional(),
  fullName: z.string().min(2).optional(),
});

export const POST = withValidation(createUserSchema, async (req: NextRequest, body) => {
  const adminUsername = req.headers.get('x-username');
  const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;

  if (!admin || (admin.role !== 'admin' && admin.role !== 'accountant')) {
    return jsonError('Not authorized', 403);
  }

  const { username, password, role, fullName } = body as z.infer<typeof createUserSchema>;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return jsonError('Username already exists', 409);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: role || 'staff',
      fullName,
    },
  });
  return jsonOk({ user: { username: user.username, role: user.role, fullName: user.fullName } });
});