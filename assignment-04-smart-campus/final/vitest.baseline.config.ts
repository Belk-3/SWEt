import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

// Runs the unchanged AC1-AC5 regression file against the ORIGINAL canBook,
// so the before/after comparison uses exactly the same test code.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@/rules/availability',
        replacement: fileURLToPath(new URL('../initial/project/src/lib/canBook.ts', import.meta.url)),
      },
    ],
  },
  server: { fs: { allow: ['..'] } },
  test: {
    environment: 'node',
    include: ['src/rules/availability.test.ts'],
  },
});
