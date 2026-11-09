/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base = repository name, so the site works at https://<user>.github.io/plant-pilot/ (ADR 0004)
export default defineConfig({
  base: '/plant-pilot/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/component/**/*.test.tsx', 'tests/contract/**/*.test.ts'],
  },
});
