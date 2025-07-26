export const routes = [
    {
        path: '/login',
        name: 'login',
        meta: { title: 'Login' },
        component: () => import('@/features/auth/views/Login.vue'),
    },
    {
        path: '/regsiter',
        name: 'register',
        meta: { title: 'Register' },
        component: () => import('@/features/auth/views/Register.vue'),
    },
];
