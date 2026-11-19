import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    coverage: {
      threshold: {
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
