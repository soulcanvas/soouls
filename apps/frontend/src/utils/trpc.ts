import type { AppRouter } from '@soouls/api/router';
import { type CreateTRPCReact, createTRPCReact, httpBatchLink } from '@trpc/react-query';

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export function getTRPCClient(getToken: () => Promise<string | null>) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/trpc',
        async headers() {
          const token = await getToken();
          const headers: Record<string, string> = {
            authorization: token ? `Bearer ${token}` : '',
          };

          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const masqueradeId = params.get('masquerade');
            if (masqueradeId) {
              headers['x-masquerade-session'] = masqueradeId;
            }
          }

          return headers;
        },
      }),
    ],
  });
}
