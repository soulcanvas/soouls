import { realpathSync } from 'node:fs';
import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import next from 'next';

const appRoot = realpathSync.native(resolve(dirname(fileURLToPath(import.meta.url)), '..'));

function readPort() {
  const portFlagIndex = process.argv.indexOf('--port');
  if (portFlagIndex >= 0) {
    const fromFlag = Number.parseInt(process.argv[portFlagIndex + 1] ?? '', 10);
    if (Number.isFinite(fromFlag)) {
      return fromFlag;
    }
  }

  const fromArg = Number.parseInt(process.argv[2] ?? '', 10);
  if (Number.isFinite(fromArg)) {
    return fromArg;
  }

  const fromEnv = Number.parseInt(process.env.PORT ?? '3002', 10);
  return Number.isFinite(fromEnv) ? fromEnv : 3002;
}

const port = readPort();
const hostname = 'localhost';

const app = next({
  dev: true,
  webpack: true,
  dir: appRoot,
  hostname,
  port,
});

const handle = app.getRequestHandler();

await app.prepare();

http
  .createServer((req, res) => {
    void handle(req, res);
  })
  .listen(port, hostname, () => {
    console.log(`[SoulLabs Command Center] Listening on http://${hostname}:${port}`);
  });
