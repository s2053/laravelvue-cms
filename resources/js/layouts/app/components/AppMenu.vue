<script setup lang="ts">
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

import { useAuthStore } from '@/features/auth/auth.store';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const auth = useAuthStore();

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' },
            { label: 'Users', icon: 'pi pi-fw pi-home', to: '/dashboard/users' },
        ],
    },
    {
        label: 'Posts',
        items: [
            { label: 'Posts', icon: 'pi pi-fw pi-id-card', to: '/dashboard/posts' },
            { label: 'Post Category', icon: 'pi pi-fw pi-circle', to: '/dashboard/post-categories' },
            { label: 'Tags', icon: 'pi pi-fw pi-circle', to: '/dashboard/post-tags' },
        ],
    },
    {
        label: 'Pages',
        items: [
            { label: 'Page Category', icon: 'pi pi-fw pi-id-card', to: '/dashboard/page-categories' },
            { label: 'Pages', icon: 'pi pi-fw pi-circle', to: '/dashboard/pages' },
        ],
    },
    {
        label: 'Roles And Permissions',
        items: [
            { label: 'Roles', icon: 'pi pi-fw pi-id-card', to: '/dashboard/roles' },
            { label: 'Permissions Group', icon: 'pi pi-fw pi-circle', to: '/dashboard/permission-groups' },
            { label: 'Permissions', icon: 'pi pi-fw pi-circle', to: '/dashboard/permissions' },
        ],
    },

    {
        label: 'Site Management',
        items: [
            { label: 'Site Settings', icon: 'pi pi-fw pi-id-card', to: '/dashboard/site-settings' },
            { label: 'Widgets', icon: 'pi pi-fw pi-briefcase', to: '/dashboard/widgets' },
            { label: 'Menu Management', icon: 'pi pi-fw pi-list', to: '/dashboard/widgets/menu' },
        ],
    },

    {
        label: 'Settings',
        items: [
            { label: 'Prfile', icon: 'pi pi-fw pi-id-card', to: '/dashboard/settings/profile' },
            { label: 'password', icon: 'pi pi-fw pi-clone', to: '/dashboard/settings/password' },
            { label: 'Appearcnce', icon: 'pi pi-fw pi-circle', to: '/dashboard/settings/appearance' },
            {
                label: 'Logout',
                icon: 'pi pi-fw pi-sign-out',

                command: async () => {
                    await auth.logout(); // wait for logout to finish

                    // show toast on successful logout
                    toast.add({ severity: 'success', summary: 'Logged out', detail: 'You have successfully logged out.' });

                    // redirect after logout
                    router.push('/login');
                },
            },
        ],
    },

    // {
    //     label: 'Pages',
    //     icon: 'pi pi-fw pi-briefcase',
    //     to: '/pages',
    //     items: [
    //         {
    //             label: 'Landing',
    //             icon: 'pi pi-fw pi-globe',
    //             to: '/landing',
    //         },
    //         {
    //             label: 'Auth',
    //             icon: 'pi pi-fw pi-user',
    //             items: [
    //                 {
    //                     label: 'Login',
    //                     icon: 'pi pi-fw pi-sign-in',
    //                     to: '/auth/login',
    //                 },
    //                 {
    //                     label: 'Error',
    //                     icon: 'pi pi-fw pi-times-circle',
    //                     to: '/auth/error',
    //                 },
    //                 {
    //                     label: 'Access Denied',
    //                     icon: 'pi pi-fw pi-lock',
    //                     to: '/auth/access',
    //                 },
    //             ],
    //         },
    //         {
    //             label: 'Crud',
    //             icon: 'pi pi-fw pi-pencil',
    //             to: '/pages/crud',
    //         },
    //         {
    //             label: 'Not Found',
    //             icon: 'pi pi-fw pi-exclamation-circle',
    //             to: '/pages/notfound',
    //         },
    //         {
    //             label: 'Empty',
    //             icon: 'pi pi-fw pi-circle-off',
    //             to: '/pages/empty',
    //         },
    //     ],
    // },
    // {
    //     label: 'Hierarchy',
    //     items: [
    //         {
    //             label: 'Submenu 1',
    //             icon: 'pi pi-fw pi-bookmark',
    //             items: [
    //                 {
    //                     label: 'Submenu 1.1',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [
    //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
    //                     ],
    //                 },
    //                 {
    //                     label: 'Submenu 1.2',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }],
    //                 },
    //             ],
    //         },
    //         {
    //             label: 'Submenu 2',
    //             icon: 'pi pi-fw pi-bookmark',
    //             items: [
    //                 {
    //                     label: 'Submenu 2.1',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [
    //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
    //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
    //                     ],
    //                 },
    //                 {
    //                     label: 'Submenu 2.2',
    //                     icon: 'pi pi-fw pi-bookmark',
    //                     items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }],
    //                 },
    //             ],
    //         },
    //     ],
    // },
    {
        label: 'Get Started',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: '/documentation',
            },
            {
                label: 'View Source',
                icon: 'pi pi-fw pi-github',
                url: 'https://github.com/primefaces/sakai-vue',
                target: '_blank',
            },
        ],
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
