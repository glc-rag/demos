import { defineConfig } from 'vite';

export default defineConfig({
    root: __dirname,
    publicDir: 'public',
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'https://glc-rag.hu',
                changeOrigin: true,
            },
            '/auth': {
                target: 'https://glc-rag.hu',
                changeOrigin: true,
            },
            '/admin': {
                target: 'https://glc-rag.hu',
                changeOrigin: true,
            },
            '/chat': {
                target: 'https://glc-rag.hu',
                changeOrigin: true,
            },
            '/widget': {
                target: 'https://glc-rag.hu',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
