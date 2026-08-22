import ui from '@nuxt/ui/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';

import svgLoader from 'vite-svg-loader';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.ts'],
            refresh: true,
        }),
        tailwindcss(),
        vue(),
        ui({
            components: {
                resolvers: [PrimeVueResolver()],
            },
        }),
        svgLoader(),
        tsconfigPaths(),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
    },
});
