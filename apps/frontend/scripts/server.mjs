import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import next from 'next';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number.parseInt(process.argv[2] ?? process.env.PORT ?? '3001', 10);
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
    console.log(`[Soouls Frontend] Listening on http://${hostname}:${port}`);
  });
