import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    coverage: {
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 40,
      },
    },
  },
});
