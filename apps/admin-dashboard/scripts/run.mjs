import { spawn } from 'node:child_process';
import { existsSync, realpathSync, symlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = realpathSync.native(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
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
  throw new Error('No command provided to apps/admin-dashboard/scripts/run.mjs');
}

const nextSubcommand = command === 'next' ? args[0] : undefined;
const _env =
  nextSubcommand === 'build' || nextSubcommand === 'start'
    ? {
        ...process.env,
        NODE_ENV: 'production',
      }
    : process.env;

const spawnOptions = {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
  shell: false,
};

const child =
  command === 'next' && args[0] === 'dev'
    ? spawn('node', [devServerScript, ...(args.slice(1) || [])], spawnOptions)
    : command === 'next'
      ? spawn('node', [nextCli, ...args], spawnOptions)
      : command === 'bunx'
        ? spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, spawnOptions)
        : spawn(process.platform === 'win32' && !command.endsWith('.exe') ? command + '.cmd' : command, args, { ...spawnOptions, shell: true });

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
