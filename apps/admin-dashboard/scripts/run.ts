import { spawn } from 'node:child_process';
import { existsSync, symlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const localNodeModules = resolve(appRoot, 'node_modules');
const frontendNodeModules = resolve(appRoot, '..', 'frontend', 'node_modules');
const nextCli = resolve(localNodeModules, 'next', 'dist', 'bin', 'next');
const devServerScript = resolve(appRoot, 'scripts', 'server.mjs');

function ensureNodeModules() {
  if (existsSync(localNodeModules)) {
    return;
  }

  if (!existsSync(frontendNodeModules)) {
    throw new Error(
      `Missing shared dependencies. Expected frontend node_modules at ${frontendNodeModules}.`,
    );
  }

  symlinkSync(frontendNodeModules, localNodeModules, 'junction');
}

ensureNodeModules();

const [command, ...args] = process.argv.slice(2);

if (!command) {
  throw new Error('No command provided to apps/admin-dashboard/scripts/run.ts');
}

const spawnOptions = {
  cwd: appRoot,
  stdio: 'inherit' as const,
  env: process.env,
};

const child =
  command === 'next' && args[0] === 'dev'
    ? spawn('node', [devServerScript, ...(args.slice(1) || [])], spawnOptions)
    : command === 'next'
      ? spawn('node', [nextCli, ...args], spawnOptions)
      : command === 'bunx'
        ? spawn(process.execPath, ['x', ...args], spawnOptions)
        : spawn(command, args, spawnOptions);

function stopChild(signal: NodeJS.Signals = 'SIGTERM') {
  if (!child.killed && child.exitCode === null) {
    child.kill(signal);
  }
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    stopChild(signal);
  });
}

process.on('exit', () => {
  stopChild();
});

child.on('exit', (code: number | null) => {
  process.exit(code ?? 0);
});
