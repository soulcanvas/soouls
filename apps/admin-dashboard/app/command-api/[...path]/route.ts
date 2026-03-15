import { NextResponse } from 'next/server';
import { forwardCommandCenterRequest } from '../../../src/server/command-center';

async function handle(request: Request, params: { path?: string[] }) {
  const response = await forwardCommandCenterRequest((params.path ?? []).join('/'), request);
  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') ?? 'application/json',
    },
  });
}

export async function GET(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  return handle(request, await context.params);
}

export async function POST(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  return handle(request, await context.params);
}

export async function PATCH(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  return handle(request, await context.params);
}

export async function DELETE(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  return handle(request, await context.params);
}
