import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entryPoint = resolve(appRoot, 'src', 'main.ts');

const child = spawn('bun', ['run', '--env-file=../../.env', entryPoint], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
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
