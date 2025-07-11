import AppLayout from '@/layouts/app/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/dashboard',
        component: AppLayout,
        children: [
            {
                path: '',
                name: 'dashboard',
                meta: { title: 'Dashboard' },
                component: () => import('@/pages/Dashboard.vue'),
            },
            {
                path: 'page-categories',
                name: 'page-categories.index',
                meta: { title: 'Page Categories' },
                component: () => import('@/pages/pages/PageCategory.vue'),
            },
            {
                path: 'pages',
                name: 'pages.index',
                meta: { title: 'Pages' },
                component: () => import('@/pages/pages/Pages.vue'),
            },
            {
                path: 'pages/create',
                name: 'pages.create',
                meta: { title: 'Pages' },
                component: () => import('@/pages/pages/Create.vue'),
            },

            {
                path: 'pages/:id/edit',
                name: 'pages.edit',
                component: () => import('@/pages/pages/Create.vue'),
            },
            {
                path: 'users',
                name: 'users.index',
                meta: { title: 'Users' },
                component: () => import('@/pages/users/Users.vue'),
            },
            {
                path: 'roles',
                name: 'roles.index',
                meta: { title: 'Roles' },
                component: () => import('@/pages/roles/Roles.vue'),
            },
            {
                path: 'permission-groups',
                name: 'permission-groups.index',
                meta: { title: 'Permission Groups' },
                component: () => import('@/pages/permissions/PermissionGroup.vue'),
            },
            {
                path: 'permissions',
                name: 'permissions.index',
                meta: { title: 'Permissions' },
                component: () => import('@/pages/permissions/Permissions.vue'),
            },
            {
                path: 'settings/password',
                name: 'settings.password',
                meta: { title: 'Change Password' },
                component: () => import('@/pages/settings/Password.vue'),
            },
            {
                path: 'settings/profile',
                name: 'settings.profile',
                meta: { title: 'Profile' },
                component: () => import('@/pages/settings/Profile.vue'),
            },
            {
                path: 'settings/appearance',
                name: 'settings.appearance',
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

// Dynamic page titles
router.afterEach((to) => {
    document.title = (to.meta?.title || 'Dashboard') + ' | My App';
});

export default router;
