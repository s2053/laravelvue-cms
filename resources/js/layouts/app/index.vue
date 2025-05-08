<script setup lang="ts">
import { AppContent, AppFooter, AppHeader, AppSidebar } from '@/layouts/app/components';
</script>

<template>
    <AppSidebar />

    <AppHeader />
    <AppContent>
    <slot />
    </AppContent>
    <AppFooter />
</template>

<style scoped>
/* .w-screen{} */
</style>
