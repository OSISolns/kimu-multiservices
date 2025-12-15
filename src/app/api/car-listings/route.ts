import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/jwt';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const listings = await prisma.carListing.findMany({
            where: { userId: parseInt(user.userId) },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(listings);
    } catch (error) {
        console.error('Error fetching car listings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const make = formData.get('make') as string;
        const model = formData.get('model') as string;
        const year = parseInt(formData.get('year') as string);
        const price = parseFloat(formData.get('price') as string);
        const mileage = parseInt(formData.get('mileage') as string);
        const condition = formData.get('condition') as string;
        const transmission = formData.get('transmission') as string;
        const fuelType = formData.get('fuelType') as string;
        const color = formData.get('color') as string;
        const description = formData.get('description') as string;
        const contactPhone = formData.get('contactPhone') as string;
        const location = formData.get('location') as string;

        const images = formData.getAll('images');
        const imageUrls: string[] = [];

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cars');
        try {
            await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));
        } catch (e) {
            // Ignore if exists
        }

        for (const image of images) {
            if (image instanceof File) {
                const buffer = Buffer.from(await image.arrayBuffer());
                const filename = `${uuidv4()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
                const filepath = path.join(uploadDir, filename);
                await writeFile(filepath, buffer);
                imageUrls.push(`/uploads/cars/${filename}`);
            }
        }

        const listing = await prisma.carListing.create({
            data: {
                userId: parseInt(user.userId),
                make,
                model,
                year,
                price,
                mileage,
                condition,
                transmission,
                fuelType,
                color,
                description,
                contactPhone,
                location,
                images: imageUrls,
                status: 'pending',
            },
        });

        return NextResponse.json(listing);
    } catch (error) {
        console.error('Error creating car listing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
