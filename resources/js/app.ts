import './bootstrap';

import Alpine from 'alpinejs';

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';

import Aura from '@primeuix/themes/aura';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import '../css/styles.scss';

window.Alpine = Alpine;

Alpine.start();

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark',

            cssLayer: false,
        },
    },
}).use(router);

app.use(pinia);
app.use(ToastService);
app.use(ConfirmationService);
app.mount('#app');
