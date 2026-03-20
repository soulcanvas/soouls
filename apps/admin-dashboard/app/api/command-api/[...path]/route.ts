import { getAuth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const pathString = path.join('/');
  const search = request.nextUrl.search;

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/command-center/${pathString}${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-User-Id': userId,
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('[Proxy] GET error:', error);
    return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const pathString = path.join('/');
  const body = await request.text();

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/command-center/${pathString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-User-Id': userId,
      },
      body,
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('[Proxy] POST error:', error);
    return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 502 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const pathString = path.join('/');
  const body = await request.text();

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/command-center/${pathString}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-User-Id': userId,
      },
      body,
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('[Proxy] PATCH error:', error);
    return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 502 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const pathString = path.join('/');

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/command-center/${pathString}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-User-Id': userId,
      },
      credentials: 'include',
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('[Proxy] DELETE error:', error);
    return NextResponse.json({ message: 'Failed to connect to backend' }, { status: 502 });
  }
}

export const config = {
  matcher: ['/command-api/:path*'],
};
