<template>
    <AppContent>
        <div class="flex h-screen">
            <!-- Sidebar -->
            <aside class="surface-card w-64">
                <div class="p-4">
                    <h2 class="text-surface-900 mb-6 text-lg font-semibold">Settings</h2>

                    <nav class="space-y-1">
                        <router-link
                            v-for="item in menuItems"
                            :key="item.to"
                            :to="item.to"
                            class="hover:text-primary flex items-center rounded-lg p-3 font-medium no-underline transition-colors duration-150 hover:!bg-[var(--surface-hover)]"
                            :class="{ 'active-link': $route.path === item.to }"
                        >
                            <i :class="item.icon" class="mr-3 text-lg"></i>
                            <span>{{ item.label }}</span>
                        </router-link>
                    </nav>
                </div>
            </aside>

            <!-- Main Content (Right) -->
            <div class="flex-1 overflow-auto">
                <div class="p-8">
                    <!-- Auto Heading -->

                    <router-view />
                </div>
            </div>
        </div>
    </AppContent>
</template>
<script setup lang="ts">
import AppContent from '@/layouts/app/components/AppContent.vue';

const menuItems = [
    { label: 'Profile', icon: 'pi pi-user', to: '/dashboard/account/profile' },
    { label: 'Security', icon: 'pi pi-lock', to: '/dashboard/account/security' },
    { label: 'Preferences', icon: 'pi pi-cog', to: '/dashboard/account/preferences' },
];
</script>

<style>
.router-link-active,
.active-link {
    background-color: var(--p-surface-200);
    color: var(--primary-color);
}

.router-link-active:hover,
.active-link:hover {
    background-color: var(--p-surface-200);
    color: var(--primary-color);
}

.app-dark .router-link-active,
.app-dark .active-link,
.app-dark .router-link-active:hover,
.app-dark .active-link:hover {
    background-color: var(--surface-hover);
    color: var(--primary-color);
}
</style>
