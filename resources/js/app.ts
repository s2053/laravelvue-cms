import './bootstrap';

import ui from '@nuxt/ui/vue-plugin';
import Alpine from 'alpinejs';

import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

window.Alpine = Alpine;

Alpine.start();

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(router);

app.use(ui);
app.use(pinia);
app.mount('#app');
