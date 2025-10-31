export const routes = [
    {
        path: 'widgets',
        name: 'widgets.index',
        meta: { title: 'Widgets' },
        component: () => import('@/features/widgets/views/WidgetIndex.vue'),
    },
    {
        path: 'widgets/menu',
        name: 'widgets.menu',
        meta: { title: 'Menu Management' },
        component: () => import('@/features/widgets/views/MenuIndex.vue'),
    },
    {
        path: 'widgets/menu/:id',
        name: 'widgets.menu.edit',
        meta: { title: 'Edit Menu' },
        component: () => import('@/features/widgets/views/MenuUpdate.vue'),
    },
];
