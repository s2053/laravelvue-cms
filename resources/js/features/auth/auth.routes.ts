export const routes = [
    {
        path: 'login',
        name: 'login',
        meta: { title: 'Login' },
        component: () => import('@/features/auth/views/Login.vue'),
    },
    {
        path: 'register',
        name: 'register',
        meta: { title: 'Register' },
        component: () => import('@/features/auth/views/Register.vue'),
    },
    {
        path: 'verify-email',
        name: 'verify-email',
        meta: { title: 'Verify Email' },
        component: () => import('@/features/auth/views/VerifyEmail.vue'),
    },
    {
        path: 'forgot-password',
        name: 'forgot-password',
        meta: { title: 'Forgot Password' },
        component: () => import('@/features/auth/views/ForgotPassword.vue'),
    },
    {
        path: 'reset-password',
        name: 'reset-password',
        meta: { title: 'Reset Password' },
        component: () => import('@/features/auth/views/ResetPassword.vue'),
    },
];
