import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { importAliases } from './vitest.aliases.js';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: { alias: importAliases },
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/main.ts'],
    },
  },
});
