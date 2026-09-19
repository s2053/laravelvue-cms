<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isDashboardRoute = computed(() => route.path.startsWith('/dashboard'));
const title = computed(() => String(route.meta?.title || (isDashboardRoute.value ? 'Dashboard' : 'My App')));
</script>

<template>
    <UDashboardNavbar :toggle="false" class="app-shell-header" :ui="{ left: 'gap-3', right: 'gap-2' }">
        <template #left>
            <UDashboardSidebarCollapse v-if="isDashboardRoute" class="hidden lg:flex" />
            <UDashboardSidebarToggle v-if="isDashboardRoute" class="lg:hidden" />

            <router-link to="/dashboard" class="flex min-w-0 items-center gap-3 no-underline">
                <div class="min-w-0">
                    <p class="app-shell-brand-title truncate text-sm font-semibold">Home</p>
                    <p v-if="!isDashboardRoute" class="app-shell-brand-subtitle truncate text-xs">{{ title }}</p>
                </div>
            </router-link>
        </template>

        <template #right>
            <AppButton v-if="isDashboardRoute" color="neutral" variant="ghost" square aria-label="Notifications">
                <UChip color="error" inset>
                    <UIcon name="i-lucide-bell" class="size-5" />
                </UChip>
            </AppButton>

            <AppButton v-if="isDashboardRoute" square icon="i-lucide-plus" aria-label="Create new" class="app-shell-fab" />
        </template>
    </UDashboardNavbar>
</template>
