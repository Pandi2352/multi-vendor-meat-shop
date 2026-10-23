import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { importAliases } from '../vitest.aliases.js';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: { alias: importAliases },
  test: {
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./setup-env.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
