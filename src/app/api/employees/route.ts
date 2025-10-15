import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Employees API: Starting employee fetch...');
    
    // Get all users with employee-related roles
    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ['staff', 'admin', 'tofficer', 'agent', 'accountant']
        }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Employees API: Found employees:', employees.length);
    
    return NextResponse.json({
      success: true,
      employees: employees
    });
  } catch (error) {
    console.error('Employees API: Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Server error', 
      details: message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Employees API: Creating new employee...');
    
    const body = await req.json();
    const { username, fullName, email, phone, role, department, password } = body;
    
    // Validate required fields
    if (!username || !fullName || !role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: username, fullName, role'
      }, { status: 400 });
    }
    
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'Username already exists'
      }, { status: 409 });
    }
    
    // Create new employee
    const newEmployee = await prisma.user.create({
      data: {
        username,
        fullName,
        email: email || null,
        phone: phone || null,
        role,
        department: department || null,
        passwordHash: password || 'defaultPassword123', // In production, this should be properly hashed
        status: 'active'
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('Employees API: Employee created successfully:', newEmployee);
    
    return NextResponse.json({
      success: true,
      employee: newEmployee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Employees API: Error creating employee:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: 'Failed to create employee',
      details: message
    }, { status: 500 });
  }
}
