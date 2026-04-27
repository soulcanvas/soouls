declare module '@trpc/server' {
  export class TRPCError extends Error {
    constructor(input: any);
  }

  export const initTRPC: {
    context<_TContext>(): {
      create(): {
        router: any;
        procedure: any;
        middleware: any;
      };
    };
  };
}

declare module '@trpc/client' {
  export function createTRPCProxyClient<_TRouter>(input: any): any;
  export function httpBatchLink(input: any): any;
}
