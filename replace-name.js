const fs = require('node:fs');
const path = require('node:path');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  'dist',
  'build',
  '.husky',
]);

const EXCLUDED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.mp4',
  '.mov',
  '.zip',
  '.tar',
  '.gz',
  '.lockb',
  '.lock',
]);

const REPLACE_MAP = [
  { from: /soulcanvas/g, to: 'soouls' },
  { from: /Soulcanvas/g, to: 'Soouls' },
  { from: /SoulCanvas/g, to: 'Soouls' },
  { from: /SOULCANVAS/g, to: 'SOOULS' },
  { from: /soul\s+canvas/g, to: 'soouls' },
  { from: /Soul\s+Canvas/g, to: 'Soouls' },
  { from: /SOUL\s+CANVAS/g, to: 'SOOULS' },
];

function processPath(targetPath) {
  const stats = fs.statSync(targetPath);

  if (stats.isDirectory()) {
    const dirName = path.basename(targetPath);
    if (EXCLUDED_DIRS.has(dirName)) {
      return;
    }
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      processPath(path.join(targetPath, file));
    }
  } else if (stats.isFile()) {
    const ext = path.extname(targetPath).toLowerCase();
    if (EXCLUDED_EXTENSIONS.has(ext)) return;

    // Check if filename itself indicates binary like .bun.lockb
    if (targetPath.endsWith('bun.lockb') || targetPath.endsWith('bun.lock')) return;

    // Exclude our script
    if (path.basename(targetPath) === 'replace-name.js') return;

    try {
      let content = fs.readFileSync(targetPath, 'utf8');
      const originalContent = content;

      for (const { from, to } of REPLACE_MAP) {
        content = content.replace(from, to);
      }

      if (content !== originalContent) {
        fs.writeFileSync(targetPath, content, 'utf8');
        console.log(`Updated: ${targetPath}`);
      }
    } catch (e) {
      // Ignore files that can't be read as utf8
      if (!e.message.includes('ENOENT')) {
        // console.error(`Error processing ${targetPath}: ${e.message}`);
      }
    }
  }
}

processPath(__dirname);
console.log('Replacement complete.');
