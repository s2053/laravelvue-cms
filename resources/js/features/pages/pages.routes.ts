export const routes = [
    {
        path: 'page-categories',
        name: 'page-categories.index',
        meta: { title: 'Page Categories' },
        component: () => import('@/features/pages/views/PageCategoryIndex.vue'),
    },
    {
        path: 'pages',
        name: 'pages.index',
        meta: { title: 'Pages' },
        component: () => import('@/features/pages/views/PageIndex.vue'),
    },
    {
        path: 'pages/create',
        name: 'pages.create',
        meta: { title: 'Pages' },
        component: () => import('@/features/pages/views/PageCreate.vue'),
    },

    {
        path: 'pages/:id/edit',
        name: 'pages.edit',
        component: () => import('@/features/pages/views/PageCreate.vue'),
    },
];
