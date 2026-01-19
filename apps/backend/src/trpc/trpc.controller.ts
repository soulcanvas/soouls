import { All, Controller, Req, Res } from '@nestjs/common';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { createTrpcContext } from './trpc.context';
import type { TrpcRouter } from './trpc.router';

@Controller('trpc')
export class TrpcController {
  constructor(private readonly trpcRouter: TrpcRouter) { }

  @All('*')
  async handler(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    const context = await createTrpcContext(req);

    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: req as unknown as Request,
      router: this.trpcRouter.appRouter,
      createContext: () => context,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.send(await response.text());
  }
}
