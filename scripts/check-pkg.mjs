#!/usr/bin/env node
// Prints the newest stable version of each package whose `engines.node` accepts the current Node,
// plus its peer dependencies. Usage: node scripts/check-pkg.mjs <pkg> [pkg...]

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

// Reuse the semver copy bundled with npm (next to node.exe on Windows, under the global root elsewhere).
const semverPath = [
  path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'node_modules', 'semver'),
  path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'npm', 'node_modules', 'semver'),
].find(existsSync);
if (!semverPath) throw new Error('Could not find the semver package bundled with npm');
const semver = createRequire(import.meta.url)(semverPath);

const nodeVersion = process.version;
const packages = process.argv.slice(2);

if (packages.length === 0) {
  console.error('Usage: node scripts/check-pkg.mjs <pkg> [pkg...]');
  process.exit(1);
}

const fetchPackument = async (name) => {
  const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  if (!res.ok) throw new Error(`${name}: registry returned ${res.status}`);
  return res.json();
};

const supportsNode = (manifest) => {
  const range = manifest.engines?.node;
  return !range || semver.satisfies(nodeVersion, range, { includePrerelease: false });
};

const pickVersion = (packument) => {
  const latest = packument['dist-tags'].latest;
  if (supportsNode(packument.versions[latest])) return latest;
  return Object.keys(packument.versions)
    .filter((v) => !semver.prerelease(v) && semver.lte(v, latest))
    .sort(semver.rcompare)
    .find((v) => supportsNode(packument.versions[v]));
};

console.log(`Node ${nodeVersion}\n`);
let failed = false;

for (const name of packages) {
  try {
    const packument = await fetchPackument(name);
    const latest = packument['dist-tags'].latest;
    const chosen = pickVersion(packument);
    if (!chosen) {
      console.log(`✗ ${name}: no stable version supports Node ${nodeVersion}`);
      failed = true;
      continue;
    }
    const manifest = packument.versions[chosen];
    const note = chosen === latest ? 'latest' : `latest is ${latest} (needs node ${packument.versions[latest].engines?.node})`;
    console.log(`✓ ${name}@${chosen}  [${note}]  engines.node: ${manifest.engines?.node ?? 'any'}`);
    const peers = Object.entries(manifest.peerDependencies ?? {});
    if (peers.length) console.log(`    peers: ${peers.map(([p, r]) => `${p}@${r}`).join(', ')}`);
  } catch (err) {
    console.log(`✗ ${err.message}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
