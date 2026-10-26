import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MAX_LINES = 250;
let failed = 0;

function report(title, violations) {
  if (violations.length > 0) {
    console.error(`✗ ${title}`);
    for (const v of violations) {
      console.error(`    ${v}`);
    }
    failed = 1;
  }
}

function walkDir(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        walkDir(fullPath, filterFn, fileList);
      }
    } else if (entry.isFile() && filterFn(fullPath)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const frontendDirs = ['admin/src', 'public/src'].filter((d) => fs.existsSync(path.join(ROOT, d)));
const backendDir = fs.existsSync(path.join(ROOT, 'server/src')) ? 'server/src' : null;

// 1. Frontend checks
if (frontendDirs.length > 0) {
  const feFiles = [];
  for (const d of frontendDirs) {
    walkDir(path.join(ROOT, d), (f) => f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.css'), feFiles);
  }

  const shadowHits = [];
  const roundedHits = [];
  const metaEnvHits = [];
  const feConsoleHits = [];

  for (const file of feFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (rel.endsWith('styles/theme.css')) continue;
    const lines = fs.readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      // Check shadow
      if (/(^|[\s"'`:])(drop-|inset-|text-)?shadow(-[][a-z0-9/.-]+)?/.test(line)) {
        shadowHits.push(`${rel}:${lineNum}: ${line.trim()}`);
      }

      // Check rounded
      const roundedMatches = line.match(/\brounded(-[a-z0-9]+)*/g);
      if (roundedMatches) {
        for (const m of roundedMatches) {
          if (!/:?rounded(-(t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?-(md|full|none)$/.test(m)) {
            roundedHits.push(`${rel}:${lineNum}: ${m}`);
          }
        }
      }

      // Check import.meta.env
      if (line.includes('import.meta.env') && !rel.includes('src/config/env.ts') && !rel.endsWith('vite-env.d.ts')) {
        metaEnvHits.push(`${rel}:${lineNum}: ${line.trim()}`);
      }

      // Check console.log
      if (line.includes('console.log') && !rel.includes('src/lib/logger.ts')) {
        feConsoleHits.push(`${rel}:${lineNum}: ${line.trim()}`);
      }
    });
  }

  report('Shadow utilities are not allowed', shadowHits);
  report('Only rounded-md (and rounded-full for avatars/dots) is allowed', roundedHits);
  report('import.meta.env is only allowed in src/config/env.ts', metaEnvHits);
  report('Raw console.log is not allowed (use lib/logger)', feConsoleHits);
}

// 2. Backend checks
if (backendDir) {
  const beFiles = walkDir(path.join(ROOT, backendDir), (f) => f.endsWith('.ts'));
  const objectIdHits = [];
  const processEnvHits = [];
  const beConsoleHits = [];

  for (const file of beFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const isSeed = rel.includes('server/src/database/seeds/');
    const isConfig = rel.includes('server/src/config/');
    const lines = fs.readFileSync(file, 'utf8').split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      if (line.includes('ObjectId')) {
        objectIdHits.push(`${rel}:${lineNum}: ${line.trim()}`);
      }

      if (line.includes('process.env') && !isConfig && !isSeed) {
        processEnvHits.push(`${rel}:${lineNum}: ${line.trim()}`);
      }

      if (line.includes('console.log') && !isSeed) {
        beConsoleHits.push(`${rel}:${lineNum}: ${line.trim()}`);
      }
    });
  }

  report('ObjectId is not allowed — use UUID v7 strings', objectIdHits);
  report('process.env is only allowed in server/src/config', processEnvHits);
  report('Raw console.log is not allowed (use the Pino logger)', beConsoleHits);
}

// 3. File length check
const allSrcDirs = [...frontendDirs];
if (backendDir) allSrcDirs.push(backendDir);
const allFiles = [];
for (const d of allSrcDirs) {
  walkDir(path.join(ROOT, d), (f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.generated.ts') && !f.endsWith('.spec.ts') && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx') && !f.includes('/seeds/') && !f.includes('\\seeds\\'), allFiles);
}

const overLengthHits = [];
for (const f of allFiles) {
  const count = fs.readFileSync(f, 'utf8').split('\n').length;
  if (count > MAX_LINES) {
    overLengthHits.push(`${path.relative(ROOT, f).replace(/\\/g, '/')}: ${count} lines`);
  }
}
report(`Files over ${MAX_LINES} lines — split them`, overLengthHits);

if (failed === 0) {
  console.log('✓ All project rules pass');
}
process.exit(failed);
