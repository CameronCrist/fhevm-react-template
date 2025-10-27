import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'FHE API is running',
    version: '1.0.0',
    endpoints: [
      '/api/fhe/encrypt',
      '/api/fhe/decrypt',
      '/api/fhe/compute'
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      data: body
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
