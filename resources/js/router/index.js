import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard' }
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Set dynamic page titles
router.afterEach((to) => {
  document.title = (to.meta?.title || 'Dashboard') + ' | My App';
});

export default router;
