import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, symlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const nestCli = resolve(appRoot, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js');
const distMain = resolve(appRoot, 'dist', 'apps', 'backend', 'src', 'main.js');
const workspaceRoot = resolve(appRoot, '..', '..');
const sourcePackagesRoot = resolve(workspaceRoot, 'packages');
const distPackagesRoot = resolve(appRoot, 'dist', 'packages');
const bunStoreRoot = resolve(workspaceRoot, 'node_modules', '.bun');
const backendManifestPath = resolve(appRoot, 'package.json');

type PackageManifest = {
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  version?: string;
};

type StoreCandidate = {
  packagePath: string;
  version: string;
};

function ensureDistPackageNodeModules() {
  const packageDirs = readdirSync(sourcePackagesRoot, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const packageDir of packageDirs) {
    const sourceNodeModules = resolve(sourcePackagesRoot, packageDir.name, 'node_modules');
    if (!existsSync(sourceNodeModules)) {
      continue;
    }

    const distPackageDir = resolve(distPackagesRoot, packageDir.name);
    const distNodeModules = resolve(distPackageDir, 'node_modules');

    if (!existsSync(distPackageDir)) {
      mkdirSync(distPackageDir, { recursive: true });
    }

    if (!existsSync(distNodeModules)) {
      symlinkSync(sourceNodeModules, distNodeModules, 'junction');
    }
  }
}

function ensureBackendRuntimeDependency(packageName: string) {
  const localDependency = resolve(appRoot, 'node_modules', packageName);
  if (existsSync(localDependency)) {
    return localDependency;
  }

  const storeDependency = selectStoreCandidate(packageName)?.packagePath;
  if (!storeDependency) {
    return null;
  }

  mkdirSync(dirname(localDependency), { recursive: true });
  symlinkSync(storeDependency, localDependency, 'junction');
  return localDependency;
}

function readPackageManifest(packagePath: string) {
  const manifestPath = resolve(packagePath, 'package.json');
  if (!existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageManifest;
}

function compareVersions(a: string, b: string) {
  const aParts =
    a
      .split('-')[0]
      ?.split('.')
      .map((part) => Number.parseInt(part, 10) || 0) ?? [];
  const bParts =
    b
      .split('-')[0]
      ?.split('.')
      .map((part) => Number.parseInt(part, 10) || 0) ?? [];

  for (let index = 0; index < Math.max(aParts.length, bParts.length); index += 1) {
    const difference = (aParts[index] ?? 0) - (bParts[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

function versionSatisfies(version: string, range: string) {
  if (!range || range === '*' || range === 'latest') {
    return true;
  }

  const normalizedRange = range.replace(/^[=v]/, '');
  if (/^\d+\.\d+\.\d+(-.+)?$/.test(normalizedRange)) {
    return version === normalizedRange;
  }

  const prefix = normalizedRange[0];
  const expected = normalizedRange.slice(1);
  const [major = 0, minor = 0] = expected.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const [versionMajor = 0, versionMinor = 0] =
    version
      .split('-')[0]
      ?.split('.')
      .map((part) => Number.parseInt(part, 10) || 0) ?? [];

  if (prefix === '^') {
    return versionMajor === major && compareVersions(version, expected) >= 0;
  }

  if (prefix === '~') {
    return (
      versionMajor === major && versionMinor === minor && compareVersions(version, expected) >= 0
    );
  }

  return true;
}

function indexStoreCandidates() {
  const packageIndex = new Map<string, StoreCandidate[]>();
  const storeDirs = readdirSync(bunStoreRoot, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const storeDir of storeDirs) {
    const storeNodeModules = resolve(bunStoreRoot, storeDir.name, 'node_modules');
    if (!existsSync(storeNodeModules)) {
      continue;
    }

    const entries = readdirSync(storeNodeModules, { withFileTypes: true }).filter((entry) =>
      entry.isDirectory(),
    );

    for (const entry of entries) {
      if (entry.name.startsWith('@')) {
        const scopeRoot = resolve(storeNodeModules, entry.name);
        const scopedEntries = readdirSync(scopeRoot, { withFileTypes: true }).filter((child) =>
          child.isDirectory(),
        );

        for (const scopedEntry of scopedEntries) {
          addStoreCandidate(
            packageIndex,
            `${entry.name}/${scopedEntry.name}`,
            resolve(scopeRoot, scopedEntry.name),
          );
        }

        continue;
      }

      addStoreCandidate(packageIndex, entry.name, resolve(storeNodeModules, entry.name));
    }
  }

  for (const candidates of packageIndex.values()) {
    candidates.sort((left, right) => compareVersions(right.version, left.version));
  }

  return packageIndex;
}

function addStoreCandidate(
  packageIndex: Map<string, StoreCandidate[]>,
  packageName: string,
  packagePath: string,
) {
  const manifest = readPackageManifest(packagePath);
  if (!manifest?.version) {
    return;
  }

  const candidates = packageIndex.get(packageName) ?? [];
  if (candidates.some((candidate) => candidate.packagePath === packagePath)) {
    return;
  }

  candidates.push({
    packagePath,
    version: manifest.version,
  });

  packageIndex.set(packageName, candidates);
}

const storeCandidates = indexStoreCandidates();

function selectStoreCandidate(packageName: string, versionRange = '*') {
  const candidates = storeCandidates.get(packageName) ?? [];
  return (
    candidates.find((candidate) => versionSatisfies(candidate.version, versionRange)) ??
    candidates[0] ??
    null
  );
}

function ensureDependencyTree(
  packageName: string,
  _versionRange: string,
  visited = new Set<string>(),
) {
  const localDependency =
    resolve(appRoot, 'node_modules', ...packageName.split('/')) ??
    ensureBackendRuntimeDependency(packageName);
  const linkedDependency = existsSync(localDependency)
    ? localDependency
    : ensureBackendRuntimeDependency(packageName);

  if (!linkedDependency || visited.has(linkedDependency)) {
    return;
  }

  visited.add(linkedDependency);

  const manifest = readPackageManifest(linkedDependency);
  const dependencyEntries = Object.entries({
    ...(manifest?.dependencies ?? {}),
    ...(manifest?.optionalDependencies ?? {}),
  });

  for (const [dependencyName, dependencyRange] of dependencyEntries) {
    if (dependencyRange.startsWith('workspace:')) {
      continue;
    }

    ensureDependencyTree(dependencyName, dependencyRange, visited);
  }
}

const buildResult = spawnSync('node', [nestCli, 'build'], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
});

if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

ensureDistPackageNodeModules();

const backendManifest =
  readPackageManifest(appRoot) ?? readPackageManifest(dirname(backendManifestPath));
for (const [dependencyName, dependencyRange] of Object.entries(
  backendManifest?.dependencies ?? {},
)) {
  if (dependencyRange.startsWith('workspace:')) {
    continue;
  }

  ensureDependencyTree(dependencyName, dependencyRange);
}

const child = spawn(process.execPath, ['--preserve-symlinks', distMain], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
});

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
