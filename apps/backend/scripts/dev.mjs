import { spawn } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = realpathSync.native(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const entryPoint = resolve(appRoot, 'src', 'main.ts');

const child = spawn('bun', ['run', '--env-file=../../.env', entryPoint], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
  shell: false,
});

child.on('error', (error) => {
  console.error('[Soouls API] Failed to start backend dev process:', error);
  process.exit(1);
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
