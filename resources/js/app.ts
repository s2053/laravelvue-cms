import './bootstrap';

import Alpine from 'alpinejs';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';

window.Alpine = Alpine;

Alpine.start();

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                prefix: 'p',
                darkModeSelector: 'system',
                cssLayer: false,
            },
        },
    })
    .use(router)
    .mount('#app');
