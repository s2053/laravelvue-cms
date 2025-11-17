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
        label: 'Account',
        items: [
            { label: 'Prfile', icon: 'pi pi-fw pi-id-card', to: '/dashboard/account/profile' },
            { label: 'Security', icon: 'pi pi-fw pi-clone', to: '/dashboard/account/security' },
            { label: 'Preferences', icon: 'pi pi-fw pi-circle', to: '/dashboard/account/preferences' },
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
