<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
}>();
</script>

<template>
    <header class="app-page-header">
        <div>
            <h1 class="app-page-header-title">{{ title }}</h1>
            <p v-if="description" class="app-page-header-description">{{ description }}</p>
        </div>

        <div v-if="$slots.actions" class="app-page-header-actions">
            <slot name="actions" />
        </div>
    </header>
</template>
