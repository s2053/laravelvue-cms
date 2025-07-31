<script setup lang="ts">
import { AppHeader } from '@/layouts/app/components';
</script>

<template>
    <AppHeader />

    <div class="flex min-h-screen items-center justify-center px-4">
        <router-view v-slot="{ Component, route }">
            <transition mode="out-in">
                <component :is="Component" :key="route.path" />
            </transition>
        </router-view>
    </div>
    <div class="layout-mask animate-fadein"></div>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
</template>

<style scoped>
/* disable the  transition */

/* .fade-enter-active,
.fade-leave-active {
    transition-duration: 0.3s;
    transition-property: opacity;
    transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
    opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition-duration: 0.5s;
    transition-property: height, opacity, transform;
    transition-timing-function: cubic-bezier(0.55, 0, 0.1, 1);
    overflow: hidden;
}

.slide-left-enter,
.slide-right-leave-active {
    opacity: 0;
    transform: translate(2em, 0);
}

.slide-left-leave-active,
.slide-right-enter {
    opacity: 0;
    transform: translate(-2em, 0);
} */
</style>
