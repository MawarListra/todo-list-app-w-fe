import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      name: 'TodoListAPI',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'express',
        'cors',
        'helmet',
        'morgan',
        'express-rate-limit',
        'swagger-ui-express',
        'swagger-jsdoc',
        'joi',
        'uuid',
        'pg',
        'dotenv',
        'winston',
        'fs',
        'path',
        'url'
      ]
    },
    target: 'node18',
    minify: false,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/controllers': resolve(__dirname, 'src/controllers'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/repositories': resolve(__dirname, 'src/repositories'),
      '@/middleware': resolve(__dirname, 'src/middleware'),
      '@/config': resolve(__dirname, 'src/config')
    }
  },
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
