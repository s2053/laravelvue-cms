export const routes = [
    {
        path: 'media',
        name: 'media.index',
        meta: { title: 'Media Library' },
        component: () => import('@/features/media/views/MediaLibrary.vue'),
    },
];
