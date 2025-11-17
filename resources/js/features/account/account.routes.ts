export const routes = [
    {
        path: '/dashboard/account',
        component: () => import('@/features/account/layouts/AccountLayout.vue'),
        children: [
            {
                path: 'profile',
                name: 'account.profile',
                component: () => import('@/features/account/views/Profile.vue'),
                meta: { title: 'Edit Profile' },
            },
            {
                path: 'security',
                name: 'account.security',
                component: () => import('@/features/account/views/Security.vue'),
                meta: { title: 'Security' },
            },
            {
                path: 'preferences',
                name: 'account.preferences',
                component: () => import('@/features/account/views/Preferences.vue'),
                meta: { title: 'Preferences' },
            },
        ],
    },
];
