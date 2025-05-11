import './bootstrap';

import Alpine from 'alpinejs';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '../css/styles.scss';

window.Alpine = Alpine;

Alpine.start();

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark',

            cssLayer: false,
        },
    },
}).use(router);

app.use(ToastService);
app.use(ConfirmationService);
app.mount('#app');
