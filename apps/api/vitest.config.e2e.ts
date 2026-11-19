import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    coverage: {
      thresholds: {
        lines: 30,
        functions: 20,
        branches: 20,
      },
    },
  },
});
