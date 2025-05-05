import './bootstrap';

import Alpine from 'alpinejs';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

window.Alpine = Alpine;

Alpine.start();

createApp(App).use(router).mount('#app');
