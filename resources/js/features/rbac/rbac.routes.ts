export const routes = [
    {
        path: 'permission-groups',
        name: 'permission-group.index',
        meta: { title: 'Permission Groups' },
        component: () => import('@/features/rbac/views/PermissionGroupIndex.vue'),
    },
    {
        path: 'permissions',
        name: 'permissions.index',
        meta: { title: 'Permissions' },
        component: () => import('@/features/rbac/views/PermissionIndex.vue'),
    },
    {
        path: 'roles',
        name: 'roles.index',
        meta: { title: 'Roles' },
        component: () => import('@/features/rbac/views/RoleIndex.vue'),
    },
];
