import AppLayout from '@/layouts/app/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/dashboard',
        component: AppLayout,
        children: [
            {
                path: '/dashboard',
                name: 'dashboard',
                meta: { title: 'Dashboard' },

                component: () => import('@/pages/Dashboard.vue'),
            },
            {
                path: '/dashboard/roles/',
                name: 'Roles',
                meta: { title: 'Roles' },

                component: () => import('@/pages/roles/Roles.vue'),
            },
            {
                path: '/dashboard/permission-group/',
                name: 'Permission Group',
                meta: { title: 'Permission Group' },

                component: () => import('@/pages/permissions/PermissionGroup.vue'),
            },
            {
                path: '/dashboard/permissions/',
                name: 'Permissions',
                meta: { title: 'Permissions' },

                component: () => import('@/pages/permissions/Permissions.vue'),
            },
            {
                path: '/dashboard/settings/password/',
                name: 'Passwprd',
                meta: { title: 'Passwprd' },

                component: () => import('@/pages/settings/Password.vue'),
            },
            {
                path: '/dashboard/settings/profile/',
                name: 'profile',
                meta: { title: 'Profile' },

                component: () => import('@/pages/settings/Profile.vue'),
            },
            {
                path: '/dashboard/settings/appearance/',
                name: 'appearance',
                meta: { title: 'Appearance' },

                component: () => import('@/pages/settings/Appearance.vue'),
            },
        ],
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
