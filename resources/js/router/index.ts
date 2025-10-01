import { routes as authRoutes } from '@/features/auth/auth.routes';
import { useAuthStore } from '@/features/auth/auth.store';
import { routes as pagesRoutes } from '@/features/pages/pages.routes';
import { routes as postsRoutes } from '@/features/posts/posts.routes';
import { routes as rbacRoutes } from '@/features/rbac/rbac.routes';
import { routes as siteRoutes } from '@/features/sites/sites.routes';
import { routes as userRoutes } from '@/features/users/users.routes';
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
            ...rbacRoutes,
            ...userRoutes,
            ...siteRoutes,

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

const blockedAuthRoutes: string[] = ['login', 'register', 'forgot-password', 'reset-password'];

router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();

    const isLoggedIn = auth.isAuthenticated;
    const user = auth.user;
    const isDashboardRoute = to.path.startsWith('/dashboard');
    // const isAuthPage = to.name?.toString().includes('login');
    const isAuthPage = blockedAuthRoutes.includes(to.name as string);

    const isVerifyPage = to.name === 'verify-email';

    if (isAuthPage && to.query.verified === '1' && isLoggedIn) {
        await auth.fetchUser();
    }

    // Not logged in? Block dashboard
    if (isDashboardRoute && !isLoggedIn) {
        return next({ path: '/login' });
    }

    // Already logged in? Block login
    if (isAuthPage && isLoggedIn) {
        return next({ name: 'dashboard' });
    }

    // Logged in but not verified? Block dashboard
    if (isDashboardRoute && isLoggedIn && auth.user && !auth.user.email_verified_at) {
        return next({ name: 'verify-email' });
    }

    // Verified user trying to access verify-email? Redirect to dashboard
    if (isVerifyPage && isLoggedIn && auth.user && auth.user.email_verified_at) {
        return next({ name: 'dashboard' });
    }

    next();
});

// Dynamic page titles
router.afterEach((to) => {
    document.title = (to.meta?.title || 'Dashboard') + ' | My App';
});

export default router;
