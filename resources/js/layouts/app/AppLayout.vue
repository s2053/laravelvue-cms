<script setup lang="ts">
import { AppHeader, AppSidebar } from '@/layouts/app/components';
import { useLayout } from '@/layouts/app/composables/layout';
import { computed } from 'vue';

const { layoutState } = useLayout();

function getTransition(routeMetaTransition: unknown) {
    return typeof routeMetaTransition === 'string' ? routeMetaTransition : 'slide-left';
}

const shellClasses = computed(() => ({
    'app-dark': document.documentElement.classList.contains('app-dark'),
}));
</script>

<template>
    <UDashboardGroup unit="px" :persistent="false" class="app-shell h-screen overflow-hidden" :class="shellClasses">
        <AppSidebar />

        <UDashboardPanel class="app-shell-main min-w-0">
            <AppHeader />
            <main class="min-h-0 flex-1 overflow-y-auto">
                <router-view v-slot="{ Component, route }">
                    <transition :name="getTransition(route.meta.transition)" mode="out-in">
                        <component :is="Component" :key="route.path" />
                    </transition>
                </router-view>
            </main>
        </UDashboardPanel>
    </UDashboardGroup>
</template>
