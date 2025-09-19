export const routes = [
    {
        path: 'site-settings',
        name: 'site-settings.index',
        meta: { title: 'Site settings' },
        component: () => import('@/features/sites/views/SiteIndex.vue'),
    },
];
