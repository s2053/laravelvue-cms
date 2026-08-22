<template>
    <AppContent>
        <div class="app-account-layout">
            <aside class="app-account-layout__sidebar">
                <h2 class="app-account-layout__title">Account Settings</h2>
                <nav class="app-account-layout__nav">
                    <router-link
                        v-for="item in menuItems"
                        :key="item.to"
                        :to="item.to"
                        class="app-account-layout__link"
                        :class="{ 'is-active': $route.path === item.to }"
                    >
                        <UIcon :name="item.icon" class="app-account-layout__icon" /><span>{{ item.label }}</span>
                    </router-link>
                </nav>
            </aside>
            <main class="app-account-layout__main"><router-view /></main>
        </div>
    </AppContent>
</template>
<script setup lang="ts">
import AppContent from '@/layouts/app/components/AppContent.vue';
const menuItems = [
    { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/account/profile' },
    { label: 'Security', icon: 'i-lucide-lock-keyhole', to: '/dashboard/account/security' },
    { label: 'Preferences', icon: 'i-lucide-settings-2', to: '/dashboard/account/preferences' },
];
</script>
