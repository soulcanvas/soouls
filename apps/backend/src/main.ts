import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// @ts-ignore — @nestjs/platform-express re-exports helmet types
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Security: HTTP Headers ──────────────────────────────────────────────
  // Helmet sets a suite of well-known protective HTTP headers
  // (CSP, X-Content-Type-Options, HSTS, etc.)
  app.use(helmet());

  // ─── Trust Proxy ────────────────────────────────────────────────────────
  // Ensures req.ip resolves to the real client IP when behind a reverse proxy
  // (Nginx, Cloudflare, etc.), which is required by the rate limiter.
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // ─── CORS ────────────────────────────────────────────────────────────────
  // Only the frontend origin is allowed. Defaults to localhost:3001 in dev.
  const allowedOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3001';
  app.enableCors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`[SoulCanvas API] Listening on port ${process.env.PORT ?? 3000}`);
  console.log(`[SoulCanvas API] CORS allowed origin: ${allowedOrigin}`);
}

bootstrap();
