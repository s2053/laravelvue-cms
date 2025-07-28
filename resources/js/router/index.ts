import { routes as authRoutes } from '@/features/auth/auth.routes';
import { useAuthStore } from '@/features/auth/auth.store';
import { routes as pagesRoutes } from '@/features/pages/pages.routes';
import { routes as postsRoutes } from '@/features/posts/posts.routes';
import AppLayout from '@/layouts/app/AppLayout.vue';
import AuthLayout from '@/layouts/auth/AuthLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        component: AuthLayout,
        children: [...authRoutes],
    },
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
            ...pagesRoutes,
            ...postsRoutes,

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

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    const isLoggedIn = auth.isAuthenticated;
    const isDashboardRoute = to.path.startsWith('/dashboard');
    const isAuthPage = to.name?.toString().includes('login');

    if (isDashboardRoute && !isLoggedIn) {
        // Block access to dashboard if not logged in
        next({ path: '/login' });
    } else if (isAuthPage && isLoggedIn) {
        //  Already logged in, go to dashboard
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

// Dynamic page titles
router.afterEach((to) => {
    document.title = (to.meta?.title || 'Dashboard') + ' | My App';
});

export default router;
