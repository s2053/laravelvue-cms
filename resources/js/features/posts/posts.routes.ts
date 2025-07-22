export const routes = [
    {
        path: 'post-tags',
        name: 'post-tags.index',
        meta: { title: 'Post Tags' },
        component: () => import('@/features/posts/views/PostTagIndex.vue'),
    },
    {
        path: 'post-categories',
        name: 'post-categories.index',
        meta: { title: 'Post Categories' },
        component: () => import('@/features/posts/views/PostCategoryIndex.vue'),
    },
    {
        path: 'posts',
        name: 'posts.index',
        meta: { title: 'Posts' },
        component: () => import('@/features/posts/views/PostIndex.vue'),
    },
    {
        path: 'posts/create',
        name: 'posts.create',
        meta: { title: 'Create Posts' },
        component: () => import('@/features/posts/views/PostCreate.vue'),
    },

    {
        path: 'posts/:id/edit',
        name: 'posts.edit',
        meta: { title: 'Edit Posts' },
        component: () => import('@/features/posts/views/PostCreate.vue'),
    },
];
