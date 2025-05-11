import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'

import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css',  'resources/js/app.ts'],
            refresh: true,
        }),
        tailwindcss(),
        vue(),
        Components({
            resolvers: [
              PrimeVueResolver()
            ]
          })
    ],
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@css':path.resolve(__dirname, 'resources/css'),  // Alias for SCSS/CSS

        },

      },
});
