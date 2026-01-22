import { useAuth } from '@clerk/nextjs';
import type { AppRouter } from '@soulcanvas/api/router';
import { httpBatchLink } from '@trpc/client';
import { type CreateTRPCReact, createTRPCReact } from '@trpc/react-query';

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export function getTRPCClient(getToken: () => Promise<string | null>) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/trpc',
        async headers() {
          const token = await getToken();
          return {
            authorization: token ? `Bearer ${token}` : '',
          };
        },
      }),
    ],
  });
}
