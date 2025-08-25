import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    console.log('Image upload request received');
    
    const formData = await req.formData();
    console.log('FormData received, checking for image field...');
    
    // Debug: Log all form data keys
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      console.log('FormData key:', key, 'Type:', typeof value, 'Value:', value);
    });
    
    const file = formData.get('image'); // Changed from 'file' to 'image' to match frontend
    console.log('File extracted:', file ? 'Yes' : 'No', 'Type:', typeof file);
    
    if (!file || typeof file === 'string') {
      console.log('File validation failed:', { hasFile: !!file, fileType: typeof file });
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    console.log('File details:', { 
      name: file.name, 
      type: file.type, 
      size: file.size 
    });
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('File type validation failed:', file.type);
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File size validation failed:', file.size);
      return NextResponse.json({ error: 'File size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Create vehicles directory if it doesn't exist
    const vehiclesDir = path.join(process.cwd(), 'public', 'vehicles');
    console.log('Vehicles directory path:', vehiclesDir);
    
    try {
      await fs.access(vehiclesDir);
      console.log('Vehicles directory exists');
    } catch {
      console.log('Creating vehicles directory...');
      await fs.mkdir(vehiclesDir, { recursive: true });
      console.log('Vehicles directory created');
    }
    
    const filePath = path.join(vehiclesDir, fileName);
    console.log('File will be saved to:', filePath);
    
    await fs.writeFile(filePath, buffer);
    console.log('File written successfully');
    
    const imageUrl = `/vehicles/${fileName}`;
    console.log('Image URL:', imageUrl);
    
    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl, // Changed from 'url' to 'imageUrl' to match frontend
      message: 'Image uploaded successfully'
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 