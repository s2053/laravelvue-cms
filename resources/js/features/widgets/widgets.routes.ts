export const routes = [
    {
        path: 'widgets',
        name: 'widgets.index',
        meta: { title: 'Widgets' },
        component: () => import('@/features/widgets/views/WidgetIndex.vue'),
    },
];
