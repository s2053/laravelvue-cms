export const routes = [
    {
        path: 'users',
        name: 'users.index',
        meta: { title: 'Users' },
        component: () => import('@/features/users/views/UserIndex.vue'),
    },
];
