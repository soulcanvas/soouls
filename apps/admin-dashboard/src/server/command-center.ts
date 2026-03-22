import { auth } from '@clerk/nextjs/server';

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? 'http://localhost:3000';
}

export async function forwardCommandCenterRequest(path: string, request: Request) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const upstreamUrl = new URL(`/command-center/${path}`, getBackendUrl());
  const incomingUrl = new URL(request.url);
  upstreamUrl.search = incomingUrl.search;

  return fetch(upstreamUrl, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': request.headers.get('Content-Type') ?? 'application/json',
    },
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
    cache: 'no-store',
  });
}
