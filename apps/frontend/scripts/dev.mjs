import { spawn } from 'node:child_process';
import net from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

async function isPortAvailable(port) {
  return new Promise((resolvePort) => {
    const server = net
      .createServer()
      .once('error', () => resolvePort(false))
      .once('listening', () => {
        server.close(() => resolvePort(true));
      })
      .listen(port);
  });
}

async function findAvailablePort(startPort, attempts = 20) {
  for (let i = 0; i < attempts; i += 1) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`No available port found starting at ${startPort}`);
}

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const devServerScript = resolve(appRoot, 'scripts', 'server.mjs');

const requestedPort = Number.parseInt(process.env.PORT ?? '3001', 10);
const startPort = Number.isFinite(requestedPort) ? requestedPort : 3001;

const port = await findAvailablePort(startPort);
if (port !== startPort) {
  console.warn(
    `Port ${startPort} is in use. Starting Next.js on port ${port}. Set PORT to override.`,
  );
}

const child = spawn('node', [devServerScript, String(port)], {
  cwd: appRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
  },
});

function stopChild(signal = 'SIGTERM') {
  if (!child.killed && child.exitCode === null) {
    child.kill(signal);
  }
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopChild(signal);
  });
}

process.on('exit', () => {
  stopChild();
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
