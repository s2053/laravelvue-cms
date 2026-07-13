<script setup lang="ts">
import { AppFooter, AppHeader, AppSidebar } from '@/layouts/app/components';
import { useLayout } from '@/layouts/app/composables/layout';
import { computed } from 'vue';

const { layoutState, isSidebarActive } = useLayout();

function getTransition(routeMetaTransition) {
    return routeMetaTransition ?? 'slide-left';
}

const shellClasses = computed(() => ({
    'app-dark': document.documentElement.classList.contains('app-dark'),
}));
</script>

<template>
    <div class="app-shell h-screen overflow-hidden" :class="shellClasses">
        <div class="app-shell flex h-screen overflow-hidden">
            <AppSidebar />

            <div class="app-shell-main flex flex-col">
                <AppHeader />
                <div class="min-h-0 flex-1 overflow-y-auto">
                <router-view v-slot="{ Component, route }">
                    <transition :name="getTransition(route.meta.transition)" mode="out-in">
                        <component :is="Component" :key="route.path" />
                    </transition>
                </router-view>
            </div>
                <AppFooter />
            </div>
        </div>
        <button
            v-if="isSidebarActive"
            type="button"
            class="app-shell-backdrop fixed inset-0 z-30 lg:hidden"
            @click="layoutState.staticMenuMobileActive = false"
        />
    </div>
    <Toast />
    <ConfirmDialog />
</template>
