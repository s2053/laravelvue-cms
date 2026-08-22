<script setup lang="ts">
import AppMenuItem from './AppMenuItem.vue';
defineProps<{
    collapsed?: boolean;
}>();

const primaryItems = [
    { label: 'Home', icon: 'i-lucide-layout-dashboard', to: '/dashboard' },
    { label: 'Users', icon: 'i-lucide-users', to: '/dashboard/users' },
    {
        label: 'Posts',
        icon: 'i-lucide-file-text',
        children: [
            { label: 'Posts', to: '/dashboard/posts' },
            { label: 'Post Categories', to: '/dashboard/post-categories' },
            { label: 'Tags', to: '/dashboard/post-tags' },
        ],
    },
    {
        label: 'Pages',
        icon: 'i-lucide-files',
        children: [
            { label: 'Pages', to: '/dashboard/pages' },
            { label: 'Page Categories', to: '/dashboard/page-categories' },
        ],
    },
    {
        label: 'Access',
        icon: 'i-lucide-shield-check',
        children: [
            { label: 'Roles', to: '/dashboard/roles' },
            { label: 'Permission Groups', to: '/dashboard/permission-groups' },
            { label: 'Permissions', to: '/dashboard/permissions' },
        ],
    },
    {
        label: 'Site',
        icon: 'i-lucide-globe',
        children: [
            { label: 'Site Settings', to: '/dashboard/site-settings' },
            { label: 'Media Library', to: '/dashboard/media' },
            { label: 'Widgets', to: '/dashboard/widgets' },
            { label: 'Menu Management', to: '/dashboard/widgets/menu' },
        ],
    },
    {
        label: 'Account',
        icon: 'i-lucide-settings',
        children: [
            { label: 'Profile', to: '/dashboard/account/profile' },
            { label: 'Security', to: '/dashboard/account/security' },
            { label: 'Preferences', to: '/dashboard/account/preferences' },
        ],
    },
    { label: 'Dashboard Lab', icon: 'i-lucide-flask-conical', to: '/dashboard/labs' },
];

const supportItems = [
    { label: 'Feedback', icon: 'i-lucide-message-circle' },
    { label: 'Help & Support', icon: 'i-lucide-info' },
];
</script>

<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <nav class="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            <AppMenuItem v-for="item in primaryItems" :key="item.label" :item="item" :collapsed="collapsed" />
        </nav>

        <nav class="mt-auto space-y-1 pt-6">
            <AppMenuItem v-for="item in supportItems" :key="item.label" :item="item" :collapsed="collapsed" />
        </nav>
    </div>
</template>
